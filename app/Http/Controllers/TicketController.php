<?php

namespace App\Http\Controllers;

use App\Models\Lottery;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Purchase;
use App\Models\Ticket;
use App\Models\TicketReservation;
use App\Models\Transaction;
use App\Models\User;
use App\Services\LotteryDrawService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TicketController extends Controller
{
    public function __construct(private readonly LotteryDrawService $drawService)
    {
    }

    public function verify(string $code): JsonResponse
    {
        $ticket = Ticket::with(['lottery.result', 'user'])
            ->whereRaw('UPPER(ticket_number) = ?', [strtoupper(trim($code))])
            ->first();

        if (! $ticket) {
            return response()->json(['success' => false, 'message' => 'Ticket not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'ticket' => $ticket,
            'drawSeedHash' => $ticket->lottery?->result?->is_published
                ? $ticket->lottery->result->draw_seed_hash
                : null,
        ]);
    }

    public function purchase(Request $request, string $lotteryId): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['nullable', 'integer', 'min:1', 'max:20'],
            'slot_numbers' => ['nullable', 'array', 'min:1', 'max:20'],
            'slot_numbers.*' => ['integer', 'min:1'],
            'payment_method' => ['nullable', 'in:wallet,mfs'],
            'gateway' => ['nullable', 'required_if:payment_method,mfs', 'in:bKash,Nagad,Rocket,Upay'],
            'sender_number' => ['nullable', 'required_if:payment_method,mfs', 'string', 'min:6', 'max:64'],
            'trx_id' => ['nullable', 'required_if:payment_method,mfs', 'string', 'min:4', 'max:100'],
        ]);

        $authUser = $request->user();
        $paymentMethod = $validated['payment_method'] ?? 'wallet';

        $result = DB::transaction(function () use ($lotteryId, $validated, $authUser, $paymentMethod) {
            $lottery = Lottery::where('id', $lotteryId)
                ->orWhere('slug', $lotteryId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lottery->status !== 'active' || now()->gte($lottery->end_at)) {
                throw new \RuntimeException('Lottery campaign is not currently accepting purchases.');
            }

            // Expire stale held reservations and clear current user's held lock
            TicketReservation::where('lottery_id', $lottery->id)
                ->where('status', 'held')
                ->where('expires_at', '<=', now())
                ->delete();

            TicketReservation::where('lottery_id', $lottery->id)
                ->where('user_id', $authUser->id)
                ->where('status', 'held')
                ->delete();

            $soldSlots = Ticket::where('lottery_id', $lottery->id)
                ->where('status', '!=', 'refunded')
                ->whereNotNull('slot_number')
                ->lockForUpdate()
                ->pluck('slot_number')
                ->all();

            $activeReservations = TicketReservation::where('lottery_id', $lottery->id)
                ->where(function ($q) {
                    $q->where('status', 'pending_payment')
                        ->orWhere(function ($q2) {
                            $q2->where('status', 'held')->where('expires_at', '>', now());
                        });
                })
                ->lockForUpdate()
                ->get();

            $reservedLookup = [];
            foreach ($activeReservations as $r) {
                foreach ($r->slot_numbers_json ?? [] as $s) {
                    $reservedLookup[(int) $s] = true;
                }
            }

            $targetSlots = [];
            if (! empty($validated['slot_numbers'])) {
                $targetSlots = array_values(array_unique(array_map('intval', $validated['slot_numbers'])));
                sort($targetSlots);
                foreach ($targetSlots as $slot) {
                    if ($slot < 1 || $slot > $lottery->total_tickets) {
                        throw new \RuntimeException("Ticket #{$slot} is outside campaign bounds.");
                    }
                    if (in_array($slot, $soldSlots, true)) {
                        throw new \RuntimeException("Ticket #{$slot} is already sold.");
                    }
                    if (isset($reservedLookup[$slot])) {
                        throw new \RuntimeException("Ticket #{$slot} is reserved by another player.");
                    }
                }
            } else {
                $qty = (int) ($validated['quantity'] ?? 1);
                for ($s = 1; $s <= $lottery->total_tickets && count($targetSlots) < $qty; $s++) {
                    if (! in_array($s, $soldSlots, true) && ! isset($reservedLookup[$s])) {
                        $targetSlots[] = $s;
                    }
                }
                if (count($targetSlots) < $qty) {
                    throw new \RuntimeException('Not enough available tickets remain.');
                }
            }

            $quantity = count($targetSlots);
            // Server-authoritative total price calculation
            $totalCost = round((float) $lottery->entry_fee * $quantity, 2);

            if ($paymentMethod === 'mfs') {
                $trxId = strtoupper(trim($validated['trx_id']));
                if (Payment::where('trx_id', $trxId)->exists()) {
                    throw new \RuntimeException('Duplicate Transaction ID rejected.');
                }

                // Never mark manual MFS payments as successful without admin verification
                $payment = Payment::create([
                    'id' => 'pay_' . Str::ulid(),
                    'user_id' => $authUser->id,
                    'gateway' => $validated['gateway'],
                    'sender_number' => trim($validated['sender_number']),
                    'trx_id' => $trxId,
                    'amount' => $totalCost,
                    'status' => 'pending',
                    'verification_note' => "Reserved {$quantity} slot(s) in {$lottery->name}",
                    'reserved_lottery_id' => $lottery->id,
                    'reserved_slots_json' => $targetSlots,
                ]);

                TicketReservation::create([
                    'id' => 'rsv_' . Str::ulid(),
                    'lottery_id' => $lottery->id,
                    'user_id' => $authUser->id,
                    'slot_numbers_json' => $targetSlots,
                    'status' => 'pending_payment',
                    'payment_id' => $payment->id,
                    'expires_at' => now()->addHours(24),
                ]);

                return [
                    'pending_verification' => true,
                    'payment' => $payment,
                    'reserved_slots' => $targetSlots,
                    'server_total' => $totalCost,
                ];
            }

            $user = User::where('id', $authUser->id)->lockForUpdate()->firstOrFail();
            if ((float) $user->balance < $totalCost) {
                throw new \RuntimeException('Insufficient wallet balance.');
            }

            $newBalance = round((float) $user->balance - $totalCost, 2);
            $user->update(['balance' => $newBalance]);

            $purchase = Purchase::create([
                'id' => 'pur_' . Str::ulid(),
                'user_id' => $user->id,
                'lottery_id' => $lottery->id,
                'quantity' => $quantity,
                'unit_price' => $lottery->entry_fee,
                'total_amount' => $totalCost,
                'status' => 'completed',
            ]);

            $issuedTickets = [];
            foreach ($targetSlots as $slotNum) {
                $issuedTickets[] = Ticket::create([
                    'id' => 'tkt_' . Str::ulid(),
                    'purchase_id' => $purchase->id,
                    'lottery_id' => $lottery->id,
                    'user_id' => $user->id,
                    'ticket_number' => $this->drawService->generateUniqueTicketNumber(),
                    'slot_number' => $slotNum,
                    'entry_fee' => $lottery->entry_fee,
                    'status' => 'pending',
                    'prize_amount' => 0,
                    'purchased_at' => now(),
                ]);
            }

            $lottery->increment('sold_tickets', $quantity);

            Transaction::create([
                'id' => 'txn_' . Str::ulid(),
                'user_id' => $user->id,
                'direction' => 'debit',
                'category' => 'ticket_purchase',
                'amount' => $totalCost,
                'balance_after' => $newBalance,
                'reference_id' => $purchase->id,
                'gateway' => 'Wallet',
                'description' => "Purchased {$quantity} ticket(s) for {$lottery->name}",
            ]);

            Notification::create([
                'id' => 'notif_' . Str::ulid(),
                'user_id' => $user->id,
                'title' => 'Tickets Issued',
                'message' => "{$quantity} ticket(s) issued for {$lottery->name}.",
                'type' => 'success',
            ]);

            return [
                'pending_verification' => false,
                'purchase' => $purchase,
                'tickets' => $issuedTickets,
                'server_total' => $totalCost,
            ];
        });

        return response()->json(['success' => true, ...$result], 201);
    }
}
