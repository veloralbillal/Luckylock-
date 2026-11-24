<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Banner;
use App\Models\Lottery;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Prize;
use App\Models\Transaction;
use App\Models\User;
use App\Services\LotteryDrawService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminLotteryController extends Controller
{
    public function __construct(private readonly LotteryDrawService $drawService)
    {
    }

    public function storeCampaign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'category' => ['required', 'string', 'max:100'],
            'details' => ['required', 'string', 'max:2000'],
            'entry_fee' => ['required', 'numeric', 'min:1'],
            'total_tickets' => ['required', 'integer', 'min:1'],
            'draw_mode' => ['required', 'in:auto,auto_datetime,manual'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'prizes' => ['required', 'array', 'min:1'],
            'prizes.*.title' => ['required', 'string', 'max:120'],
            'prizes.*.amount' => ['required', 'numeric', 'min:1'],
            'prizes.*.winners_count' => ['required', 'integer', 'min:1'],
        ]);

        $lottery = DB::transaction(function () use ($validated, $request) {
            $id = 'lot_' . Str::ulid();
            $totalPrizePool = collect($validated['prizes'])
                ->sum(fn ($p) => (float) $p['amount'] * (int) $p['winners_count']);

            $lot = Lottery::create([
                'id' => $id,
                'name' => $validated['name'],
                'slug' => Str::slug($validated['name']) . '-' . strtolower(Str::random(5)),
                'details' => $validated['details'],
                'category' => $validated['category'],
                'entry_fee' => $validated['entry_fee'],
                'prize_amount' => $totalPrizePool,
                'total_tickets' => $validated['total_tickets'],
                'sold_tickets' => 0,
                'draw_mode' => $validated['draw_mode'],
                'status' => strtotime($validated['start_at']) > time() + 60 ? 'scheduled' : 'active',
                'start_at' => $validated['start_at'],
                'end_at' => $validated['end_at'],
                'auto_refund_incomplete' => true,
                'created_by' => $request->user()?->id,
            ]);

            foreach ($validated['prizes'] as $idx => $tier) {
                Prize::create([
                    'id' => 'pz_' . Str::ulid(),
                    'lottery_id' => $lot->id,
                    'rank_position' => $idx + 1,
                    'title' => $tier['title'],
                    'amount' => $tier['amount'],
                    'winners_count' => $tier['winners_count'],
                ]);
            }

            return $lot->load('prizes');
        });

        return response()->json(['success' => true, 'lottery' => $lottery], 201);
    }

    public function verifyPayment(Request $request, string $paymentId): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'in:approve,reject'],
            'note' => ['nullable', 'string', 'max:300'],
        ]);

        $payment = DB::transaction(function () use ($paymentId, $validated, $request) {
            $pay = Payment::where('id', $paymentId)->lockForUpdate()->firstOrFail();
            if ($pay->status !== 'pending') {
                throw new \RuntimeException("Payment is already {$pay->status}.");
            }

            $user = User::where('id', $pay->user_id)->lockForUpdate()->firstOrFail();
            $staff = $request->user();

            if ($validated['action'] === 'approve') {
                $newBalance = round((float) $user->balance + (float) $pay->amount, 2);
                $user->update([
                    'balance' => $newBalance,
                    'total_deposited' => round((float) $user->total_deposited + (float) $pay->amount, 2),
                ]);

                $pay->update([
                    'status' => 'approved',
                    'verification_note' => $validated['note'] ?? 'Verified MFS Transaction ID',
                    'verified_by' => $staff?->id,
                    'verified_at' => now(),
                ]);

                Transaction::create([
                    'id' => 'txn_' . Str::ulid(),
                    'user_id' => $user->id,
                    'direction' => 'credit',
                    'category' => 'deposit',
                    'amount' => $pay->amount,
                    'balance_after' => $newBalance,
                    'reference_id' => $pay->id,
                    'gateway' => $pay->gateway,
                    'description' => "{$pay->gateway} deposit verified (TrxID: {$pay->trx_id})",
                ]);

                Notification::create([
                    'id' => 'notif_' . Str::ulid(),
                    'user_id' => $user->id,
                    'title' => 'Deposit Verified',
                    'message' => "Your {$pay->gateway} deposit of {$pay->amount} has been credited.",
                    'type' => 'success',
                ]);
            } else {
                $pay->update([
                    'status' => 'rejected',
                    'verification_note' => $validated['note'] ?? 'Transaction ID could not be verified',
                    'verified_by' => $staff?->id,
                    'verified_at' => now(),
                ]);
            }

            AuditLog::create([
                'id' => 'audit_' . Str::ulid(),
                'actor_id' => $staff?->id,
                'actor_username' => $staff?->username ?? 'admin',
                'action' => 'PAYMENT_' . strtoupper($validated['action']),
                'target_type' => 'payment',
                'target_id' => $pay->id,
                'details_json' => ['trx_id' => $pay->trx_id, 'amount' => $pay->amount],
                'ip_address' => $request->ip(),
            ]);

            return $pay;
        });

        return response()->json(['success' => true, 'payment' => $payment]);
    }

    public function triggerDraw(Request $request, string $lotteryId): JsonResponse
    {
        $lottery = Lottery::findOrFail($lotteryId);
        $publish = $request->boolean('publish', true);
        $result = $this->drawService->executeDraw($lottery, $request->user(), $publish);

        return response()->json(['success' => true, 'result' => $result]);
    }

    public function storeBanner(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'subtitle' => ['nullable', 'string', 'max:400'],
            'cta_label' => ['nullable', 'string', 'max:80'],
            'cta_target' => ['nullable', 'string', 'max:120'],
            'placement' => ['required', 'in:hero,announcement'],
        ]);

        $banner = Banner::create([
            'id' => 'ban_' . Str::ulid(),
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? '',
            'cta_label' => $validated['cta_label'] ?? 'Browse Lotteries',
            'cta_target' => $validated['cta_target'] ?? '#campaigns',
            'placement' => $validated['placement'],
            'is_active' => true,
            'sort_order' => Banner::count() + 1,
        ]);

        return response()->json(['success' => true, 'banner' => $banner], 201);
    }
}
