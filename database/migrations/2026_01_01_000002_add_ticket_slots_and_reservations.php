<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->unsignedInteger('slot_number')->nullable()->after('ticket_number');
            $table->unique(['lottery_id', 'slot_number'], 'uq_tickets_lottery_slot');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->string('reserved_lottery_id', 64)->nullable()->after('verified_at');
            $table->json('reserved_slots_json')->nullable()->after('reserved_lottery_id');
        });

        Schema::create('ticket_reservations', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('lottery_id', 64);
            $table->string('user_id', 64);
            $table->json('slot_numbers_json');
            $table->enum('status', ['held', 'pending_payment'])->default('held');
            $table->string('payment_id', 64)->nullable();
            $table->dateTime('expires_at');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['lottery_id', 'status', 'expires_at']);
            $table->foreign('lottery_id')->references('id')->on('lotteries')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('payment_id')->references('id')->on('payments')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_reservations');
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['reserved_lottery_id', 'reserved_slots_json']);
        });
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropUnique('uq_tickets_lottery_slot');
            $table->dropColumn('slot_number');
        });
    }
};
