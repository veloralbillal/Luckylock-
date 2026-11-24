<?php

namespace App\Http\Controllers;

use App\Models\Lottery;
use App\Models\Setting;
use App\Models\Ticket;
use App\Models\TicketReservation;
use App\Models\Winner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CampaignController extends Controller
{
    public function featured()
    {
        $lottery = Lottery::where('status', 'active')
            ->orderByDesc('prize_amount')
            ->first() ?? Lottery::orderByDesc('created_at')->firstOrFail();

        return redirect()->route('campaigns.show', ['slug' => $lottery->slug]);
    }

    public function show(Request $request, string $slug)
    {
        $lottery = Lottery::with(['prizes', 'result.winners.user'])
            ->where('slug', $slug)
            ->firstOrFail();

        // Prune expired held reservations
        TicketReservation::where('lottery_id', $lottery->id)
            ->where('status', 'held')
            ->where('expires_at', '<=', now())
            ->delete();

        $userId = $request->user()?->id;
        $slots = $this->buildSlotMap($lottery, $userId);

        $previousWinners = Winner::with(['lottery', 'user'])
            ->where('lottery_id', '!=', $lottery->id)
            ->orderByDesc('awarded_at')
            ->limit(12)
            ->get();

        $allCampaigns = Lottery::select(['id', 'slug', 'name', 'entry_fee', 'status'])
            ->orderByDesc('created_at')
            ->get();

        $myReservation = $userId
            ? TicketReservation::where('lottery_id', $lottery->id)
                ->where('user_id', $userId)
                ->where('status', 'held')
                ->where('expires_at', '>', now())
                ->first()
            : null;

        $settings = Setting::pluck('setting_value', 'setting_key');

        return view('campaigns.show', [
            'lottery' => $lottery,
            'slots' => $slots,
            'previousWinners' => $previousWinners,
            'allCampaigns' => $allCampaigns,
            'myReservation' => $myReservation,
            'settings' => $settings,
        ]);
    }

    public function reserve(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'slot_numbers' => ['required', 'array', 'min:1', 'max:20'],
            'slot_numbers.*' => ['required', 'integer', 'min:1'],
        ]);

        $user = $request->user();
        $requestedSlots = array_values(array_unique(array_map('intval', $validated['slot_numbers'])));
        sort($requestedSlots);

        $outcome = DB::transaction(function () use ($slug, $requestedSlots, $user) {
            $lottery = Lottery::where('slug', $slug)->lockForUpdate()->firstOrFail();

            if ($lottery->status !== 'active' || now()->gte($lottery->end_at)) {
                throw new \RuntimeException('This campaign is not accepting ticket reservations.');
            }

            foreach ($requestedSlots as $slot) {
                if ($slot < 1 || $slot > $lottery->total_tickets) {
                    throw new \RuntimeException("Ticket slot #{$slot} is out of campaign range.");
                }
            }

            TicketReservation::where('lottery_id', $lottery->id)
                ->where('status', 'held')
                ->where('expires_at', '<=', now())
                ->delete();

            // Clear user's previous held reservation on this campaign
            TicketReservation::where('lottery_id', $lottery->id)
                ->where('user_id', $user->id)
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

            $reservedSlots = [];
            foreach ($activeReservations as $r) {
                foreach ($r->slot_numbers_json ?? [] as $s) {
                    $reservedSlots[(int) $s] = true;
                }
            }

            foreach ($requestedSlots as $slot) {
                if (in_array($slot, $soldSlots, true)) {
                    throw new \RuntimeException("Ticket #{$slot} is already sold.");
                }
                if (isset($reservedSlots[$slot])) {
                    throw new \RuntimeException("Ticket #{$slot} is currently reserved by another player.");
                }
            }

            $reservation = TicketReservation::create([
                'id' => 'rsv_' . Str::ulid(),
                'lottery_id' => $lottery->id,
                'user_id' => $user->id,
                'slot_numbers_json' => $requestedSlots,
                'status' => 'held',
                'payment_id' => null,
                'expires_at' => now()->addMinutes(5),
            ]);

            $serverTotal = round((float) $lottery->entry_fee * count($requestedSlots), 2);

            return [
                'reservation' => $reservation,
                'server_total' => $serverTotal,
                'slots' => $this->buildSlotMap($lottery, $user->id),
            ];
        });

        return response()->json(['success' => true, ...$outcome]);
    }

    public function releaseReservation(Request $request, string $slug): JsonResponse
    {
        $lottery = Lottery::where('slug', $slug)->firstOrFail();

        TicketReservation::where('lottery_id', $lottery->id)
            ->where('user_id', $request->user()->id)
            ->where('status', 'held')
            ->delete();

        return response()->json([
            'success' => true,
            'slots' => $this->buildSlotMap($lottery, $request->user()->id),
        ]);
    }

    private function buildSlotMap(Lottery $lottery, ?string $currentUserId): array
    {
        $soldTickets = Ticket::where('lottery_id', $lottery->id)
            ->where('status', '!=', 'refunded')
            ->whereNotNull('slot_number')
            ->get()
            ->keyBy('slot_number');

        $activeReservations = TicketReservation::where('lottery_id', $lottery->id)
            ->where(function ($q) {
                $q->where('status', 'pending_payment')
                    ->orWhere(function ($q2) {
                        $q2->where('status', 'held')->where('expires_at', '>', now());
                    });
            })
            ->get();

        $reservedMap = [];
        foreach ($activeReservations as $res) {
            foreach ($res->slot_numbers_json ?? [] as $s) {
                $reservedMap[(int) $s] = [
                    'user_id' => $res->user_id,
                    'expires_at' => $res->expires_at?->toIso8601String(),
                ];
            }
        }

        $padWidth = max(3, strlen((string) $lottery->total_tickets));
        $slots = [];
        for ($s = 1; $s <= $lottery->total_tickets; $s++) {
            $label = '#' . str_pad((string) $s, $padWidth, '0', STR_PAD_LEFT);
            if ($soldTickets->has($s)) {
                $t = $soldTickets->get($s);
                $slots[] = [
                    'slotNumber' => $s,
                    'label' => $label,
                    'state' => 'sold',
                    'ticketNumber' => $t->ticket_number,
                    'ownedByMe' => $currentUserId && $t->user_id === $currentUserId,
                    'reservedByMe' => false,
                ];
            } elseif (isset($reservedMap[$s])) {
                $slots[] = [
                    'slotNumber' => $s,
                    'label' => $label,
                    'state' => 'reserved',
                    'ticketNumber' => null,
                    'ownedByMe' => false,
                    'reservedByMe' => $currentUserId && $reservedMap[$s]['user_id'] === $currentUserId,
                ];
            } else {
                $slots[] = [
                    'slotNumber' => $s,
                    'label' => $label,
                    'state' => 'available',
                    'ticketNumber' => null,
                    'ownedByMe' => false,
                    'reservedByMe' => false,
                ];
            }
        }

        return $slots;
    }
}
