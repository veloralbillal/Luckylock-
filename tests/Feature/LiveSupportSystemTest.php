<?php

namespace Tests\Feature;

use App\Models\Support\SupportChat;
use App\Models\Support\SupportDepartment;
use App\Models\Support\SupportRepresentative;
use App\Services\SupportAssignmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Tests\TestCase;

class LiveSupportSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_enforces_max_one_active_chat_per_representative_and_queues_second_customer(): void
    {
        $dept = SupportDepartment::create(['name' => 'General', 'slug' => 'general', 'is_active' => true]);
        $rep = SupportRepresentative::create([
            'name' => 'Sara Rahman',
            'username' => 'rep_sara',
            'email' => 'sara@example.com',
            'password' => Hash::make('Support123'),
            'department_id' => $dept->id,
            'status' => 'online',
            'account_status' => 'active',
            'max_active_chats' => 1,
        ]);

        $service = app(SupportAssignmentService::class);

        $chat1 = SupportChat::create([
            'ticket_code' => 'SUP-100001',
            'customer_name' => 'Customer One',
            'customer_phone' => '01711111111',
            'department_id' => $dept->id,
            'status' => 'waiting',
            'queue_entered_at' => now()->subSeconds(5),
        ]);
        $chat2 = SupportChat::create([
            'ticket_code' => 'SUP-100002',
            'customer_name' => 'Customer Two',
            'customer_phone' => '01722222222',
            'department_id' => $dept->id,
            'status' => 'waiting',
            'queue_entered_at' => now(),
        ]);

        $asg1 = $service->autoAssignChat($chat1);
        $asg2 = $service->autoAssignChat($chat2);

        $this->assertNotNull($asg1);
        $this->assertNull($asg2);
        $this->assertSame('active', $chat1->fresh()->status);
        $this->assertSame($rep->id, $chat1->fresh()->representative_id);
        $this->assertSame('waiting', $chat2->fresh()->status);
        $this->assertSame('busy', $rep->fresh()->status);

        // Attempting manual double-assignment must fail atomically
        $this->expectException(RuntimeException::class);
        $service->assignOrTransferManually($chat2, $rep->fresh(), 'admin', 1);
    }

    public function test_closing_chat_automatically_assigns_next_fifo_waiting_customer(): void
    {
        $dept = SupportDepartment::create(['name' => 'General', 'slug' => 'general', 'is_active' => true]);
        $rep = SupportRepresentative::create([
            'name' => 'Rafiul Karim',
            'username' => 'rep_rafi',
            'email' => 'rafi@example.com',
            'password' => Hash::make('Support123'),
            'department_id' => $dept->id,
            'status' => 'online',
            'account_status' => 'active',
            'max_active_chats' => 1,
        ]);

        $service = app(SupportAssignmentService::class);
        $chat1 = SupportChat::create([
            'ticket_code' => 'SUP-200001',
            'customer_name' => 'First Caller',
            'customer_phone' => '01733333333',
            'department_id' => $dept->id,
            'status' => 'waiting',
            'queue_entered_at' => now()->subMinute(),
        ]);
        $chat2 = SupportChat::create([
            'ticket_code' => 'SUP-200002',
            'customer_name' => 'Second Caller',
            'customer_phone' => '01744444444',
            'department_id' => $dept->id,
            'status' => 'waiting',
            'queue_entered_at' => now(),
        ]);

        $service->autoAssignChat($chat1);
        $chat1->update(['status' => 'closed', 'closed_at' => now()]);
        $rep->update(['status' => 'online']);

        $next = $service->assignNextWaitingCustomerToRep($rep);
        $this->assertNotNull($next);
        $this->assertSame($chat2->id, $next->chat_id);
        $this->assertSame('active', $chat2->fresh()->status);
        $this->assertSame('busy', $rep->fresh()->status);
    }

    public function test_unauthorized_customer_cannot_post_to_another_customers_chat(): void
    {
        $dept = SupportDepartment::create(['name' => 'General', 'slug' => 'general', 'is_active' => true]);
        $chat = SupportChat::create([
            'ticket_code' => 'SUP-300001',
            'customer_name' => 'Owner',
            'customer_phone' => '01755555555',
            'guest_token_hash' => hash('sha256', 'valid-secret-token'),
            'department_id' => $dept->id,
            'status' => 'active',
        ]);

        $response = $this->postJson("/api/support/chats/{$chat->id}/messages", [
            'body' => 'Unauthorized hijack attempt',
        ], ['X-Support-Customer-Token' => 'wrong-token']);

        $response->assertStatus(403);
    }
}
