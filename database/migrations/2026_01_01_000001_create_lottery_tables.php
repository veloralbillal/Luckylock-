<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('username', 64)->unique();
            $table->string('full_name', 120);
            $table->string('email', 160)->unique();
            $table->string('phone', 32)->nullable();
            $table->string('password_hash');
            $table->enum('role', ['user', 'moderator', 'admin'])->default('user');
            $table->enum('status', ['active', 'blocked'])->default('active');
            $table->decimal('balance', 15, 2)->default(0);
            $table->decimal('total_deposited', 15, 2)->default(0);
            $table->decimal('total_withdrawn', 15, 2)->default(0);
            $table->unsignedInteger('wins_count')->default(0);
            $table->string('security_pin_hash')->nullable();
            $table->boolean('pin_lock_enabled')->default(false);
            $table->timestamps();
            $table->index(['role', 'status']);
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('name', 100)->unique();
            $table->string('label', 120);
            $table->enum('type', ['single', 'multi', 'syndicate'])->default('single');
            $table->string('default_prizes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('lotteries', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('name', 180);
            $table->string('slug', 200)->unique();
            $table->text('details');
            $table->string('category', 100)->index();
            $table->decimal('entry_fee', 12, 2);
            $table->decimal('prize_amount', 15, 2);
            $table->unsignedInteger('total_tickets');
            $table->unsignedInteger('sold_tickets')->default(0);
            $table->enum('draw_mode', ['auto', 'auto_datetime', 'manual'])->default('auto');
            $table->enum('status', ['scheduled', 'active', 'closed', 'drawn', 'refunded', 'paused'])->default('active');
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->dateTime('drawn_at')->nullable();
            $table->boolean('results_published')->default(false);
            $table->boolean('auto_refund_incomplete')->default(true);
            $table->string('created_by', 64)->nullable();
            $table->timestamps();
            $table->index(['status', 'start_at', 'end_at']);
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('prizes', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('lottery_id', 64);
            $table->unsignedInteger('rank_position');
            $table->string('title', 120);
            $table->decimal('amount', 15, 2);
            $table->unsignedInteger('winners_count')->default(1);
            $table->index(['lottery_id', 'rank_position']);
            $table->foreign('lottery_id')->references('id')->on('lotteries')->cascadeOnDelete();
        });

        Schema::create('purchases', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('user_id', 64);
            $table->string('lottery_id', 64);
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_amount', 15, 2);
            $table->enum('status', ['completed', 'refunded'])->default('completed');
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('lottery_id')->references('id')->on('lotteries')->cascadeOnDelete();
        });

        Schema::create('tickets', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('purchase_id', 64);
            $table->string('lottery_id', 64);
            $table->string('user_id', 64);
            $table->string('ticket_number', 32)->unique();
            $table->decimal('entry_fee', 12, 2);
            $table->enum('status', ['pending', 'won', 'lost', 'refunded'])->default('pending');
            $table->decimal('prize_amount', 15, 2)->default(0);
            $table->unsignedInteger('prize_rank')->nullable();
            $table->timestamp('purchased_at')->useCurrent();
            $table->index(['lottery_id', 'status']);
            $table->foreign('purchase_id')->references('id')->on('purchases')->cascadeOnDelete();
            $table->foreign('lottery_id')->references('id')->on('lotteries')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('user_id', 64);
            $table->enum('gateway', ['bKash', 'Nagad', 'Rocket', 'Upay', 'Bank', 'USDT']);
            $table->string('sender_number', 64);
            $table->string('trx_id', 100)->unique();
            $table->decimal('amount', 15, 2);
            $table->enum('status', ['pending', 'approved', 'rejected', 'refunded'])->default('pending');
            $table->text('verification_note')->nullable();
            $table->string('verified_by', 64)->nullable();
            $table->dateTime('verified_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('verified_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('withdrawals', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('user_id', 64);
            $table->enum('gateway', ['bKash', 'Nagad', 'Rocket', 'Upay', 'Bank', 'USDT']);
            $table->string('target_account', 100);
            $table->decimal('amount', 15, 2);
            $table->decimal('fee', 15, 2)->default(0);
            $table->decimal('total_debit', 15, 2);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_note')->nullable();
            $table->string('processed_by', 64)->nullable();
            $table->dateTime('processed_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('processed_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('lottery_results', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('lottery_id', 64)->unique();
            $table->string('draw_seed_hash', 128);
            $table->json('winning_numbers_json');
            $table->unsignedInteger('total_tickets_entered');
            $table->decimal('total_payout', 15, 2);
            $table->boolean('is_published')->default(true);
            $table->string('drawn_by', 64)->nullable();
            $table->dateTime('drawn_at')->useCurrent();
            $table->foreign('lottery_id')->references('id')->on('lotteries')->cascadeOnDelete();
            $table->foreign('drawn_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('winners', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('lottery_id', 64);
            $table->string('result_id', 64);
            $table->string('ticket_id', 64);
            $table->string('user_id', 64);
            $table->string('prize_id', 64)->nullable();
            $table->unsignedInteger('rank_position');
            $table->string('prize_title', 120);
            $table->decimal('prize_amount', 15, 2);
            $table->string('ticket_number', 32);
            $table->dateTime('awarded_at')->useCurrent();
            $table->foreign('lottery_id')->references('id')->on('lotteries')->cascadeOnDelete();
            $table->foreign('result_id')->references('id')->on('lottery_results')->cascadeOnDelete();
            $table->foreign('ticket_id')->references('id')->on('tickets')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('user_id', 64);
            $table->enum('direction', ['credit', 'debit']);
            $table->enum('category', ['deposit', 'withdrawal', 'ticket_purchase', 'prize_payout', 'refund', 'signup_bonus', 'admin_adjustment']);
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->string('reference_id', 64)->nullable();
            $table->string('gateway', 50)->nullable();
            $table->text('description');
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('user_id', 64);
            $table->string('title', 180);
            $table->text('message');
            $table->enum('type', ['info', 'success', 'warning', 'win'])->default('info');
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('banners', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('title', 180);
            $table->text('subtitle');
            $table->string('cta_label', 80)->nullable();
            $table->string('cta_target', 120)->nullable();
            $table->enum('placement', ['hero', 'announcement'])->default('announcement');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->string('setting_key', 100)->primary();
            $table->text('setting_value');
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('actor_id', 64)->nullable();
            $table->string('actor_username', 64);
            $table->string('action', 100);
            $table->string('target_type', 64);
            $table->string('target_id', 64)->nullable();
            $table->json('details_json')->nullable();
            $table->string('ip_address', 64)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('user_id', 64);
            $table->string('username', 64);
            $table->string('full_name', 120);
            $table->enum('role', ['user', 'moderator', 'admin'])->default('user');
            $table->text('message');
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('winners');
        Schema::dropIfExists('lottery_results');
        Schema::dropIfExists('withdrawals');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('purchases');
        Schema::dropIfExists('prizes');
        Schema::dropIfExists('lotteries');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('users');
    }
};
