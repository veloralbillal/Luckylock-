<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Lottery;
use App\Models\LotteryResult;
use App\Models\Notification;
use App\Models\Ticket;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Winner;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LotteryDrawService
{
    public function generateUniqueTicketNumber(): string
    {
        do {
            $candidate = 'LW-' . random_int(100000, 999999);
        } while (Ticket::where('ticket_number', $candidate)->exists());

        return $candidate;
    }

    public function executeDraw(Lottery $lottery, ?User $actor = null, bool $publishImmediately = true): LotteryResult
    {
        return DB::transaction(function () use ($lottery, $actor, $publishImmediately) {
            $lockedLottery = Lottery::where('id', $lottery->id)->lockForUpdate()->firstOrFail();

            if ($lockedLottery->status === 'drawn') {
                throw new \RuntimeException('This lottery has already been drawn.');
            }

            $tickets = Ticket::where('lottery_id', $lockedLottery->id)
                ->where('status', 'pending')
                ->lockForUpdate()
                ->get()
                ->all();

            if (count($tickets) === 0) {
                throw new \RuntimeException('Cannot execute draw with zero tickets.');
            }

            // Cryptographic Fisher-Yates shuffle using PHP 8.2+ CSPRNG random_int()
            $count = count($tickets);
            for ($i = $count - 1; $i > 0; $i--) {
                $j = random_int(0, $i);
                [$tickets[$i], $tickets[$j]] = [$tickets[$j], $tickets[$i]];
            }

            $prizes = $lockedLottery->prizes()->orderBy('rank_position')->get();
            $entropySeed = bin2hex(random_bytes(32)) . '|' . $lockedLottery->id . '|' . now()->toIso8601String();
            $drawSeedHash = hash('sha256', $entropySeed);

            $resultId = 'res_' . Str::ulid();
            $winningNumbers = [];
            $totalPayout = 0.0;
            $cursor = 0;

            $result = LotteryResult::create([
                'id' => $resultId,
                'lottery_id' => $lockedLottery->id,
                'draw_seed_hash' => $drawSeedHash,
                'winning_numbers_json' => [],
                'total_tickets_entered' => $count,
                'total_payout' => 0,
                'is_published' => $publishImmediately,
                'drawn_by' => $actor?->id,
                'drawn_at' => now(),
            ]);

            $winningTicketIds = [];

            foreach ($prizes as $prize) {
                for ($slot = 0; $slot < $prize->winners_count; $slot++) {
                    if ($cursor >= $count) {
                        break 2;
                    }
                    $ticket = $tickets[$cursor++];
                    $winningTicketIds[$ticket->id] = true;
                    $winningNumbers[] = $ticket->ticket_number;

                    $ticket->update([
                        'status' => 'won',
                        'prize_amount' => $prize->amount,
                        'prize_rank' => $prize->rank_position,
                    ]);

                    $winnerUser = User::where('id', $ticket->user_id)->lockForUpdate()->firstOrFail();
                    $newBalance = round((float) $winnerUser->balance + (float) $prize->amount, 2);
                    $winnerUser->update([
                        'balance' => $newBalance,
                        'wins_count' => $winnerUser->wins_count + 1,
                    ]);

                    Winner::create([
                        'id' => 'win_' . Str::ulid(),
                        'lottery_id' => $lockedLottery->id,
                        'result_id' => $result->id,
                        'ticket_id' => $ticket->id,
                        'user_id' => $winnerUser->id,
                        'prize_id' => $prize->id,
                        'rank_position' => $prize->rank_position,
                        'prize_title' => $prize->title,
                        'prize_amount' => $prize->amount,
                        'ticket_number' => $ticket->ticket_number,
                        'awarded_at' => now(),
                    ]);

                    Transaction::create([
                        'id' => 'txn_' . Str::ulid(),
                        'user_id' => $winnerUser->id,
                        'direction' => 'credit',
                        'category' => 'prize_payout',
                        'amount' => $prize->amount,
                        'balance_after' => $newBalance,
                        'reference_id' => $ticket->id,
                        'gateway' => 'Wallet',
                        'description' => sprintf('%s payout for ticket %s', $prize->title, $ticket->ticket_number),
                    ]);

                    Notification::create([
                        'id' => 'notif_' . Str::ulid(),
                        'user_id' => $winnerUser->id,
                        'title' => sprintf('Winner! %s', $prize->title),
                        'message' => sprintf(
                            'Your ticket %s won %s in %s.',
                            $ticket->ticket_number,
                            number_format((float) $prize->amount, 2),
                            $lockedLottery->name
                        ),
                        'type' => 'win',
                        'is_read' => false,
                    ]);

                    $totalPayout += (float) $prize->amount;
                }
            }

            foreach ($tickets as $ticket) {
                if (! isset($winningTicketIds[$ticket->id])) {
                    $ticket->update(['status' => 'lost']);
                }
            }

            $result->update([
                'winning_numbers_json' => $winningNumbers,
                'total_payout' => round($totalPayout, 2),
            ]);

            $lockedLottery->update([
                'status' => 'drawn',
                'drawn_at' => now(),
                'results_published' => $publishImmediately,
            ]);

            AuditLog::create([
                'id' => 'audit_' . Str::ulid(),
                'actor_id' => $actor?->id,
                'actor_username' => $actor?->username ?? 'SYSTEM_SCHEDULER',
                'action' => 'DRAW_EXECUTED',
                'target_type' => 'lottery',
                'target_id' => $lockedLottery->id,
                'details_json' => [
                    'draw_seed_hash' => $drawSeedHash,
                    'winning_numbers' => $winningNumbers,
                    'total_payout' => $totalPayout,
                ],
                'ip_address' => request()?->ip() ?? '127.0.0.1',
            ]);

            return $result->fresh(['winners']);
        });
    }
}
