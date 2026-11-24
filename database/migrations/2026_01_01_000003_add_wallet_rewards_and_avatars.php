<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'avatar_url')) {
                $table->string('avatar_url', 2000)->nullable()->after('phone');
            }
            if (!Schema::hasColumn('users', 'spin_credits')) {
                $table->unsignedInteger('spin_credits')->default(1)->after('balance');
            }
        });

        Schema::create('shop_orders', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('user_id', 64);
            $table->string('item_id', 64);
            $table->string('item_title', 160);
            $table->decimal('amount', 12, 2);
            $table->string('reward_summary', 255);
            $table->dateTime('created_at')->useCurrent();

            $table->index(['user_id', 'created_at']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('wheel_spins', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('user_id', 64);
            $table->unsignedTinyInteger('segment_index');
            $table->string('segment_label', 64);
            $table->decimal('reward_amount', 12, 2)->default(0);
            $table->unsignedInteger('reward_spins')->default(0);
            $table->enum('spin_type', ['daily_free', 'spin_credit'])->default('daily_free');
            $table->dateTime('created_at')->useCurrent();

            $table->index(['user_id', 'created_at']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('daily_task_claims', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('user_id', 64);
            $table->string('task_id', 64);
            $table->date('claim_date');
            $table->decimal('reward_amount', 12, 2)->default(0);
            $table->unsignedInteger('reward_spins')->default(0);
            $table->dateTime('created_at')->useCurrent();

            $table->unique(['user_id', 'task_id', 'claim_date']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_task_claims');
        Schema::dropIfExists('wheel_spins');
        Schema::dropIfExists('shop_orders');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar_url', 'spin_credits']);
        });
    }
};
