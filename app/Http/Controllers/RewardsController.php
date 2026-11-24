<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Setting;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RewardsController extends Controller
{
    private const WHEEL_SEGMENTS = [
        ['index' => 0, 'label' => '৳5 Cash', 'amount' => 5, 'spins' => 0, 'weight' => 28, 'color' => '#059669'],
        ['index' => 1, 'label' => '৳10 Cash', 'amount' => 10, 'spins' => 0, 'weight' => 22, 'color' => '#0F172A'],
        ['index' => 2, 'label' => '+1 Spin', 'amount' => 0, 'spins' => 1, 'weight' => 18, 'color' => '#D97706'],
        ['index' => 3, 'label' => '৳25 Cash', 'amount' => 25, 'spins' => 0, 'weight' => 10, 'color' => '#1E293B'],
        ['index' => 4, 'label' => '৳2 Bonus', 'amount' => 2, 'spins' => 0, 'weight' => 12, 'color' => '#047857'],
        ['index' => 5, 'label' => '৳50 Cash', 'amount' => 50, 'spins' => 0, 'weight' => 5, 'color' => '#B45309'],
        ['index' => 6, 'label' => '৳15 Cash', 'amount' => 15, 'spins' => 0, 'weight' => 4, 'color' => '#334155'],
        ['index' => 7, 'label' => '৳100 Jackpot', 'amount' => 100, 'spins' => 0, 'weight' => 1, 'color' => '#F59E0B'],
    ];

    public function wheelPage(Request $request)
    {
        $settings = Setting::pluck('setting_value', 'setting_key');
        $user = $request->user();
        $today = now()->toDateString();

        $canUseFreeDailySpin = $user
            ? ! DB::table('wheel_spins')
                ->where('user_id', $user->id)
                ->where('spin_type', 'daily_free')
                ->whereDate('created_at', $today)
                ->exists()
            : true;

        $recentSpins = $user
            ? DB::table('wheel_spins')
                ->where('user_id', $user->id)
                ->orderByDesc('created_at')
                ->limit(15)
                ->get()
            : collect();

        return view('rewards.lucky-wheel', [
            'settings' => $settings,
            'user' => $user,
            'segments' => self::WHEEL_SEGMENTS,
            'canUseFreeDailySpin' => $canUseFreeDailySpin,
            'recentSpins' => $recentSpins,
        ]);
    }

    public function tasksPage(Request $request)
    {
        $settings = Setting::pluck('setting_value', 'setting_key');
        $user = $request->user();
        $today = now()->toDateString();

        $claimedIds = $user
            ? DB::table('daily_task_claims')
                ->where('user_id', $user->id)
                ->where('claim_date', $today)
                ->pluck('task_id')
                ->all()
            : [];

        $tasks = [
            [
                'id' => 'daily_checkin',
                'title' => 'Daily Player Check-In',
                'description' => 'Log in today and claim instant wallet cash plus 1 Lucky Wheel spin credit.',
                'reward_amount' => 5,
                'reward_spins' => 1,
                'claimed_today' => in_array('daily_checkin', $claimedIds, true),
            ],
            [
                'id' => 'buy_ticket_today',
                'title' => 'Lottery Ticket Participant',
                'description' => 'Purchase at least 1 ticket in any campaign today to unlock this daily rebate.',
                'reward_amount' => 15,
                'reward_spins' => 0,
                'claimed_today' => in_array('buy_ticket_today', $claimedIds, true),
            ],
            [
                'id' => 'community_chat_today',
                'title' => 'Community Chat Check-In',
                'description' => 'Post a message in the Community Chat lounge today.',
                'reward_amount' => 5,
                'reward_spins' => 0,
                'claimed_today' => in_array('community_chat_today', $claimedIds, true),
            ],
            [
                'id' => 'mfs_deposit_today',
                'title' => 'MFS Wallet Top-Up Bonus',
                'description' => 'Submit a bKash, Nagad, Rocket, or Upay deposit via Wallet today.',
                'reward_amount' => 20,
                'reward_spins' => 1,
                'claimed_today' => in_array('mfs_deposit_today', $claimedIds, true),
            ],
        ];

        return view('rewards.daily-tasks', [
            'settings' => $settings,
            'user' => $user,
            'tasks' => $tasks,
        ]);
    }

    public function spinWheel(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $result = DB::transaction(function () use ($userId) {
            $user = User::where('id', $userId)->lockForUpdate()->firstOrFail();
            $today = now()->toDateString();

            $usedFreeToday = DB::table('wheel_spins')
                ->where('user_id', $user->id)
                ->where('spin_type', 'daily_free')
                ->whereDate('created_at', $today)
                ->exists();

            $spinType = 'daily_free';
            if ($usedFreeToday) {
                if (($user->spin_credits ?? 0) < 1) {
                    throw new \RuntimeException('No spin credits available.');
                }
                $user->decrement('spin_credits', 1);
                $spinType = 'spin_credit';
            }

            $totalWeight = array_sum(array_column(self::WHEEL_SEGMENTS, 'weight'));
            $roll = random_int(0, $totalWeight - 1);
            $chosen = self::WHEEL_SEGMENTS[0];
            foreach (self::WHEEL_SEGMENTS as $seg) {
                if ($roll < $seg['weight']) {
                    $chosen = $seg;
                    break;
                }
                $roll -= $seg['weight'];
            }

            if ($chosen['amount'] > 0) {
                $user->increment('balance', $chosen['amount']);
            }
            if ($chosen['spins'] > 0) {
                $user->increment('spin_credits', $chosen['spins']);
            }
            $user->refresh();

            $spinId = 'spin_' . Str::ulid();
            DB::table('wheel_spins')->insert([
                'id' => $spinId,
                'user_id' => $user->id,
                'segment_index' => $chosen['index'],
                'segment_label' => $chosen['label'],
                'reward_amount' => $chosen['amount'],
                'reward_spins' => $chosen['spins'],
                'spin_type' => $spinType,
                'created_at' => now(),
            ]);

            if ($chosen['amount'] > 0) {
                Transaction::create([
                    'id' => 'txn_' . Str::ulid(),
                    'user_id' => $user->id,
                    'direction' => 'credit',
                    'category' => 'admin_adjustment',
                    'amount' => $chosen['amount'],
                    'balance_after' => $user->balance,
                    'reference_id' => $spinId,
                    'gateway' => 'Lucky Wheel',
                    'description' => 'Lucky Wheel prize won: ' . $chosen['label'],
                    'created_at' => now(),
                ]);
            }

            Notification::create([
                'id' => 'notif_' . Str::ulid(),
                'user_id' => $user->id,
                'title' => 'Lucky Wheel Result',
                'message' => 'You landed on ' . $chosen['label'] . '!',
                'type' => 'success',
                'is_read' => false,
                'created_at' => now(),
            ]);

            return ['segment' => $chosen, 'balance' => $user->balance];
        });

        return response()->json(['success' => true, ...$result]);
    }

    public function claimDailyTask(Request $request, string $taskId): JsonResponse
    {
        $userId = $request->user()->id;
        $today = now()->toDateString();

        $rewards = [
            'daily_checkin' => ['amount' => 5, 'spins' => 1, 'title' => 'Daily Player Check-In'],
            'buy_ticket_today' => ['amount' => 15, 'spins' => 0, 'title' => 'Lottery Ticket Participant'],
            'community_chat_today' => ['amount' => 5, 'spins' => 0, 'title' => 'Community Chat Check-In'],
            'mfs_deposit_today' => ['amount' => 20, 'spins' => 1, 'title' => 'MFS Wallet Top-Up Bonus'],
        ];

        if (!isset($rewards[$taskId])) {
            return response()->json(['success' => false, 'message' => 'Task not found.'], 404);
        }

        $outcome = DB::transaction(function () use ($userId, $taskId, $today, $rewards) {
            $user = User::where('id', $userId)->lockForUpdate()->firstOrFail();

            $alreadyClaimed = DB::table('daily_task_claims')
                ->where('user_id', $user->id)
                ->where('task_id', $taskId)
                ->where('claim_date', $today)
                ->exists();

            if ($alreadyClaimed) {
                throw new \RuntimeException('Task already claimed today.');
            }

            $meta = $rewards[$taskId];
            if ($meta['amount'] > 0) {
                $user->increment('balance', $meta['amount']);
            }
            if ($meta['spins'] > 0) {
                $user->increment('spin_credits', $meta['spins']);
            }
            $user->refresh();

            $claimId = 'task_' . Str::ulid();
            DB::table('daily_task_claims')->insert([
                'id' => $claimId,
                'user_id' => $user->id,
                'task_id' => $taskId,
                'claim_date' => $today,
                'reward_amount' => $meta['amount'],
                'reward_spins' => $meta['spins'],
                'created_at' => now(),
            ]);

            Transaction::create([
                'id' => 'txn_' . Str::ulid(),
                'user_id' => $user->id,
                'direction' => 'credit',
                'category' => 'admin_adjustment',
                'amount' => $meta['amount'],
                'balance_after' => $user->balance,
                'reference_id' => $claimId,
                'gateway' => 'Daily Task',
                'description' => 'Daily Task reward claimed: ' . $meta['title'],
                'created_at' => now(),
            ]);

            return ['balance' => $user->balance, 'spin_credits' => $user->spin_credits];
        });

        return response()->json(['success' => true, ...$outcome]);
    }
}
