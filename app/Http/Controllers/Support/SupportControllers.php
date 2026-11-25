<?php

namespace App\Http\Controllers\Support;

use App\Events\Support\SupportChatClosed;
use App\Events\Support\SupportMessageSent;
use App\Events\Support\SupportMessagesRead;
use App\Events\Support\SupportPresenceUpdated;
use App\Http\Controllers\Controller;
use App\Models\Support\SupportAttachment;
use App\Models\Support\SupportChat;
use App\Models\Support\SupportDepartment;
use App\Models\Support\SupportMessage;
use App\Models\Support\SupportRating;
use App\Models\Support\SupportRepresentative;
use App\Models\Support\SupportSetting;
use App\Services\SupportAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CustomerSupportController extends Controller
{
    public function __construct(private SupportAssignmentService $assigner) {}

    public function startChat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'min:2', 'max:100'],
            'customer_phone' => ['required', 'string', 'min:7', 'max:32'],
            'department_id' => ['nullable', 'exists:support_departments,id'],
            'initial_message' => ['nullable', 'string', 'max:1500'],
        ]);

        $plainGuestToken = Str::random(48);
        $chat = SupportChat::create([
            'ticket_code' => 'SUP-' . random_int(100000, 999999),
            'customer_user_id' => $request->user()?->id,
            'customer_name' => $data['customer_name'],
            'customer_phone' => $data['customer_phone'],
            'customer_email' => $request->user()?->email,
            'guest_token_hash' => hash('sha256', $plainGuestToken),
            'department_id' => $data['department_id'] ?? SupportDepartment::where('is_active', true)->value('id'),
            'status' => 'waiting',
            'queue_entered_at' => now(),
        ]);

        if (!empty($data['initial_message'])) {
            $msg = SupportMessage::create([
                'chat_id' => $chat->id,
                'sender_type' => 'customer',
                'sender_id' => $request->user()?->id,
                'sender_name' => $chat->customer_name,
                'body' => $data['initial_message'],
                'delivered_at' => now(),
            ]);
            broadcast(new SupportMessageSent($msg));
        }

        $this->assigner->autoAssignChat($chat);

        return response()->json([
            'success' => true,
            'customer_token' => $plainGuestToken,
            'chat' => $chat->fresh(['representative', 'department', 'messages.attachments']),
        ], 201);
    }

    public function sendMessage(Request $request, SupportChat $chat): JsonResponse
    {
        abort_unless($this->canCustomerAccess($request, $chat), 403, 'Unauthorized chat access.');
        abort_if($chat->status === 'closed', 400, 'Conversation is closed.');

        $settings = SupportSetting::current();
        $maxKb = max(1, (int) $settings->max_upload_mb) * 1024;
        $allowedMimes = implode(',', $settings->allowed_extensions ?: ['jpg', 'png', 'pdf']);

        $validated = $request->validate([
            'body' => ['nullable', 'string', 'max:2000'],
            'attachment' => ['nullable', 'file', "max:{$maxKb}", "mimes:{$allowedMimes}"],
        ]);

        abort_if(empty($validated['body']) && !$request->hasFile('attachment'), 422, 'Message or attachment required.');

        $msg = SupportMessage::create([
            'chat_id' => $chat->id,
            'sender_type' => 'customer',
            'sender_id' => $request->user()?->id,
            'sender_name' => $chat->customer_name,
            'body' => $validated['body'] ?? 'Sent an attachment',
            'delivered_at' => now(),
        ]);

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $mime = (string) $file->getMimeType();
            abort_unless(in_array($mime, $settings->allowed_mime_types ?? [], true), 422, 'Unsupported MIME type.');
            $storedPath = $file->store("support_attachments/{$chat->id}", 'local');
            SupportAttachment::create([
                'chat_id' => $chat->id,
                'message_id' => $msg->id,
                'uploaded_by_type' => 'customer',
                'uploaded_by_id' => $request->user()?->id,
                'original_name' => $file->getClientOriginalName(),
                'storage_disk' => 'local',
                'storage_path' => $storedPath,
                'mime_type' => $mime,
                'extension' => strtolower($file->getClientOriginalExtension()),
                'size_bytes' => $file->getSize(),
            ]);
        }

        $chat->update([
            'last_message_preview' => Str::limit($msg->body, 120),
            'last_message_at' => now(),
            'rep_unread_count' => $chat->rep_unread_count + 1,
        ]);

        broadcast(new SupportMessageSent($msg->load('attachments')));

        return response()->json(['success' => true, 'message' => $msg->load('attachments')], 201);
    }

    public function closeChat(Request $request, SupportChat $chat): JsonResponse
    {
        abort_unless($this->canCustomerAccess($request, $chat), 403);
        if ($chat->status !== 'closed') {
            $rep = $chat->representative;
            $chat->update([
                'status' => 'closed',
                'closed_at' => now(),
                'closed_by_type' => 'customer',
                'closed_by_id' => $request->user()?->id,
            ]);
            broadcast(new SupportChatClosed($chat->fresh(), 'customer'));
            if ($rep && $rep->account_status === 'active' && $rep->activeChats()->count() === 0) {
                $rep->update(['status' => 'online']);
                $this->assigner->assignNextWaitingCustomerToRep($rep);
            }
        }
        return response()->json(['success' => true, 'chat' => $chat->fresh()]);
    }

    public function submitRating(Request $request, SupportChat $chat): JsonResponse
    {
        abort_unless($this->canCustomerAccess($request, $chat), 403);
        abort_if($chat->status !== 'closed', 400, 'Close conversation before rating.');
        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'feedback' => ['nullable', 'string', 'max:800'],
        ]);

        $rating = SupportRating::create([
            'chat_id' => $chat->id,
            'representative_id' => $chat->representative_id,
            'customer_name' => $chat->customer_name,
            'customer_phone' => $chat->customer_phone,
            'rating' => $data['rating'],
            'feedback' => $data['feedback'] ?? '',
        ]);

        return response()->json(['success' => true, 'rating' => $rating], 201);
    }

    private function canCustomerAccess(Request $request, SupportChat $chat): bool
    {
        if ($request->user() && $chat->customer_user_id && (int) $chat->customer_user_id === (int) $request->user()->id) {
            return true;
        }
        $token = (string) $request->header('X-Support-Customer-Token', '');
        return $token !== '' && $chat->guest_token_hash && hash_equals($chat->guest_token_hash, hash('sha256', $token));
    }
}

class RepresentativeSupportController extends Controller
{
    public function __construct(private SupportAssignmentService $assigner) {}

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $rep = SupportRepresentative::where('username', $data['identifier'])
            ->orWhere('email', $data['identifier'])
            ->first();

        if (!$rep || !Hash::check($data['password'], $rep->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid representative credentials.'], 401);
        }
        if ($rep->account_status !== 'active') {
            return response()->json(['success' => false, 'message' => 'Account suspended.'], 403);
        }

        $token = $rep->createToken('support-rep-desk', ['support:rep'])->plainTextToken;
        return response()->json(['success' => true, 'token' => $token, 'representative' => $rep]);
    }

    public function updateStatus(Request $request): JsonResponse
    {
        /** @var SupportRepresentative $rep */
        $rep = $request->user('support_rep');
        $data = $request->validate(['status' => ['required', 'in:online,offline']]);

        abort_if($rep->activeChats()->count() > 0, 400, 'Close or transfer your active chat first.');
        $rep->update(['status' => $data['status'], 'last_seen_at' => now()]);
        broadcast(new SupportPresenceUpdated($rep->id, $rep->status, true));

        $autoAssigned = $data['status'] === 'online'
            ? $this->assigner->assignNextWaitingCustomerToRep($rep)
            : null;

        return response()->json([
            'success' => true,
            'representative' => $rep->fresh(),
            'auto_assigned_chat_id' => $autoAssigned?->chat_id,
        ]);
    }

    public function transferChat(Request $request, SupportChat $chat): JsonResponse
    {
        /** @var SupportRepresentative $rep */
        $rep = $request->user('support_rep');
        abort_unless((int) $chat->representative_id === (int) $rep->id && $chat->status === 'active', 403);
        $data = $request->validate([
            'target_representative_id' => ['required', 'exists:support_representatives,id'],
            'reason' => ['nullable', 'string', 'max:240'],
        ]);
        $target = SupportRepresentative::findOrFail($data['target_representative_id']);
        $assignment = $this->assigner->assignOrTransferManually($chat, $target, 'transfer', $rep->id, $data['reason'] ?? null);

        if ($rep->fresh()->status === 'online') {
            $this->assigner->assignNextWaitingCustomerToRep($rep->fresh());
        }

        return response()->json(['success' => true, 'assignment' => $assignment]);
    }

    public function markRead(Request $request, SupportChat $chat): JsonResponse
    {
        /** @var SupportRepresentative $rep */
        $rep = $request->user('support_rep');
        abort_unless((int) $chat->representative_id === (int) $rep->id, 403);
        $now = now();
        $ids = $chat->messages()->where('sender_type', 'customer')->whereNull('read_at')->pluck('id')->all();
        if (!empty($ids)) {
            SupportMessage::whereIn('id', $ids)->update(['read_at' => $now]);
            $chat->update(['rep_unread_count' => 0]);
            broadcast(new SupportMessagesRead($chat->id, 'representative', $ids, $now->toIso8601String()));
        }
        return response()->json(['success' => true, 'updated_count' => count($ids)]);
    }
}

class AdminSupportController extends Controller
{
    public function __construct(private SupportAssignmentService $assigner) {}

    public function createRepresentative(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'username' => ['required', 'string', 'min:3', 'max:60', 'unique:support_representatives,username'],
            'email' => ['required', 'email', 'unique:support_representatives,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'department_id' => ['nullable', 'exists:support_departments,id'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $rep = SupportRepresentative::create([
            ...$data,
            'password' => Hash::make($data['password']),
            'status' => 'offline',
            'account_status' => 'active',
            'max_active_chats' => 1,
        ]);

        return response()->json(['success' => true, 'representative' => $rep], 201);
    }

    public function manualAssign(Request $request, SupportChat $chat): JsonResponse
    {
        $data = $request->validate([
            'representative_id' => ['required', 'exists:support_representatives,id'],
            'reason' => ['nullable', 'string', 'max:240'],
        ]);
        $target = SupportRepresentative::findOrFail($data['representative_id']);
        $type = $chat->representative_id && $chat->representative_id !== $target->id ? 'transfer' : 'admin';
        $assignment = $this->assigner->assignOrTransferManually($chat, $target, $type, $request->user()->id, $data['reason'] ?? null);
        return response()->json(['success' => true, 'assignment' => $assignment]);
    }
}
