<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Withdrawal;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function submitDeposit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'gateway' => ['required', 'in:bKash,Nagad,Rocket,Upay,Bank,USDT'],
            'sender_number' => ['required', 'string', 'min:5', 'max:64'],
            'trx_id' => ['required', 'string', 'min:4', 'max:100'],
            'amount' => ['required', 'numeric', 'min:50', 'max:500000'],
        ]);

        $trxId = strtoupper(trim($validated['trx_id']));
        if (Payment::where('trx_id', $trxId)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'This Transaction ID has already been submitted.',
            ], 422);
        }

        // Never mark manual MFS deposits as successful without administrator verification
        $payment = Payment::create([
            'id' => 'pay_' . Str::ulid(),
            'user_id' => $request->user()->id,
            'gateway' => $validated['gateway'],
            'sender_number' => trim($validated['sender_number']),
            'trx_id' => $trxId,
            'amount' => round((float) $validated['amount'], 2),
            'status' => 'pending',
            'verification_note' => 'Awaiting MFS Transaction ID verification',
        ]);

        return response()->json(['success' => true, 'payment' => $payment], 201);
    }

    public function requestWithdrawal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'gateway' => ['required', 'in:bKash,Nagad,Rocket,Upay,Bank,USDT'],
            'target_account' => ['required', 'string', 'min:5', 'max:100'],
            'amount' => ['required', 'numeric', 'min:50', 'max:500000'],
        ]);

        $authUser = $request->user();

        $withdrawal = DB::transaction(function () use ($validated, $authUser) {
            $user = User::where('id', $authUser->id)->lockForUpdate()->firstOrFail();
            $amount = round((float) $validated['amount'], 2);

            if ((float) $user->balance < $amount) {
                throw new \RuntimeException('Insufficient wallet balance.');
            }

            $newBalance = round((float) $user->balance - $amount, 2);
            $user->update(['balance' => $newBalance]);

            $wd = Withdrawal::create([
                'id' => 'wd_' . Str::ulid(),
                'user_id' => $user->id,
                'gateway' => $validated['gateway'],
                'target_account' => trim($validated['target_account']),
                'amount' => $amount,
                'fee' => 0,
                'total_debit' => $amount,
                'status' => 'pending',
                'admin_note' => 'Pending payout review',
            ]);

            Transaction::create([
                'id' => 'txn_' . Str::ulid(),
                'user_id' => $user->id,
                'direction' => 'debit',
                'category' => 'withdrawal',
                'amount' => $amount,
                'balance_after' => $newBalance,
                'reference_id' => $wd->id,
                'gateway' => $validated['gateway'],
                'description' => "Withdrawal request to {$validated['gateway']} ({$validated['target_account']})",
            ]);

            return $wd;
        });

        return response()->json(['success' => true, 'withdrawal' => $withdrawal], 201);
    }
}
