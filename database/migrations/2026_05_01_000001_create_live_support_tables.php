<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_departments', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);
            $table->string('slug', 80)->unique();
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('support_representatives', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('username', 60)->unique();
            $table->string('email', 150)->unique();
            $table->string('phone', 30)->nullable();
            $table->string('password');
            $table->string('avatar_url', 255)->nullable();
            $table->foreignId('department_id')->nullable()->constrained('support_departments')->nullOnDelete();
            $table->enum('status', ['online', 'busy', 'offline'])->default('offline')->index();
            $table->enum('account_status', ['active', 'suspended'])->default('active')->index();
            $table->unsignedTinyInteger('max_active_chats')->default(1);
            $table->timestamp('last_assigned_at')->nullable()->index();
            $table->timestamp('last_seen_at')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->index(['account_status', 'status', 'last_assigned_at'], 'support_reps_eligibility_idx');
        });

        Schema::create('support_chats', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_code', 32)->unique();
            $table->foreignId('customer_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('customer_name', 100);
            $table->string('customer_phone', 32)->index();
            $table->string('customer_email', 150)->nullable();
            $table->string('guest_token_hash', 64)->nullable()->index();
            $table->foreignId('department_id')->nullable()->constrained('support_departments')->nullOnDelete();
            $table->foreignId('representative_id')->nullable()->constrained('support_representatives')->nullOnDelete();
            $table->enum('status', ['waiting', 'active', 'closed'])->default('waiting')->index();
            $table->timestamp('queue_entered_at')->nullable()->index();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->enum('closed_by_type', ['customer', 'representative', 'admin'])->nullable();
            $table->unsignedBigInteger('closed_by_id')->nullable();
            $table->string('last_message_preview', 160)->nullable();
            $table->timestamp('last_message_at')->nullable()->index();
            $table->unsignedInteger('customer_unread_count')->default(0);
            $table->unsignedInteger('rep_unread_count')->default(0);
            $table->timestamps();

            $table->index(['status', 'queue_entered_at'], 'support_chats_fifo_queue_idx');
            $table->index(['representative_id', 'status'], 'support_chats_rep_active_idx');
        });

        Schema::create('support_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained('support_chats')->cascadeOnDelete();
            $table->enum('sender_type', ['customer', 'representative', 'system'])->index();
            $table->unsignedBigInteger('sender_id')->nullable();
            $table->string('sender_name', 100);
            $table->text('body');
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable()->index();
            $table->timestamps();

            $table->index(['chat_id', 'created_at'], 'support_messages_chat_order_idx');
        });

        Schema::create('support_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained('support_chats')->cascadeOnDelete();
            $table->foreignId('message_id')->nullable()->constrained('support_messages')->cascadeOnDelete();
            $table->enum('uploaded_by_type', ['customer', 'representative']);
            $table->unsignedBigInteger('uploaded_by_id')->nullable();
            $table->string('original_name', 180);
            $table->string('storage_disk', 40)->default('local');
            $table->string('storage_path', 255);
            $table->string('mime_type', 100);
            $table->string('extension', 16);
            $table->unsignedBigInteger('size_bytes');
            $table->timestamps();

            $table->index(['chat_id', 'message_id']);
        });

        Schema::create('support_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained('support_chats')->cascadeOnDelete();
            $table->foreignId('representative_id')->constrained('support_representatives')->cascadeOnDelete();
            $table->foreignId('previous_representative_id')->nullable()->constrained('support_representatives')->nullOnDelete();
            $table->enum('assigned_by_type', ['auto', 'admin', 'transfer'])->default('auto');
            $table->unsignedBigInteger('assigned_by_id')->nullable();
            $table->string('reason', 255)->nullable();
            $table->timestamp('assigned_at');
            $table->timestamp('unassigned_at')->nullable();
            $table->timestamps();

            $table->index(['chat_id', 'assigned_at']);
            $table->index(['representative_id', 'unassigned_at']);
        });

        Schema::create('support_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->unique()->constrained('support_chats')->cascadeOnDelete();
            $table->foreignId('representative_id')->nullable()->constrained('support_representatives')->nullOnDelete();
            $table->string('customer_name', 100);
            $table->string('customer_phone', 32);
            $table->unsignedTinyInteger('rating');
            $table->text('feedback')->nullable();
            $table->timestamps();

            $table->index(['representative_id', 'rating']);
        });

        Schema::create('support_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('auto_assign_enabled')->default(true);
            $table->unsignedTinyInteger('max_active_chats_per_rep')->default(1);
            $table->unsignedTinyInteger('max_upload_mb')->default(5);
            $table->json('allowed_extensions');
            $table->json('allowed_mime_types');
            $table->string('welcome_message', 400);
            $table->string('queue_message', 400);
            $table->string('offline_message', 400);
            $table->timestamps();
        });

        Schema::create('support_presence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('representative_id')->unique()->constrained('support_representatives')->cascadeOnDelete();
            $table->boolean('is_connected')->default(false)->index();
            $table->unsignedSmallInteger('socket_count')->default(0);
            $table->timestamp('last_heartbeat_at')->nullable();
            $table->timestamp('disconnected_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_presence');
        Schema::dropIfExists('support_settings');
        Schema::dropIfExists('support_ratings');
        Schema::dropIfExists('support_assignments');
        Schema::dropIfExists('support_attachments');
        Schema::dropIfExists('support_messages');
        Schema::dropIfExists('support_chats');
        Schema::dropIfExists('support_representatives');
        Schema::dropIfExists('support_departments');
    }
};
