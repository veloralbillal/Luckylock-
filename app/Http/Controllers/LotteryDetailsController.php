<?php

namespace App\Http\Controllers;

use App\Models\Lottery;
use App\Models\Setting;
use App\Models\Ticket;
use App\Models\TicketReservation;
use Illuminate\Http\Request;

class LotteryDetailsController extends Controller
{
    public function show(Request $request, string $slug)
    {
        $lottery = Lottery::with(['prizes', 'result.winners.user'])
            ->where('slug', $slug)
            ->orWhere('id', $slug)
            ->firstOrFail();

        $settings = Setting::pluck('setting_value', 'setting_key');
        $user = $request->user();

        $soldSlots = Ticket::where('lottery_id', $lottery->id)
            ->where('status', '!=', 'refunded')
            ->whereNotNull('slot_number')
            ->pluck('slot_number')
            ->all();

        $reservedSlots = TicketReservation::where('lottery_id', $lottery->id)
            ->where(function ($q) {
                $q->where('status', 'pending_payment')
                    ->orWhere(function ($q2) {
                        $q2->where('status', 'held')->where('expires_at', '>', now());
                    });
            })
            ->get()
            ->flatMap(fn ($r) => $r->slot_numbers_json ?? [])
            ->unique()
            ->values()
            ->all();

        $winners = $lottery->result && $lottery->result->is_published
            ? $lottery->result->winners()->with('user')->orderBy('rank_position')->get()
            : collect();

        return view('lotteries.show', [
            'lottery' => $lottery,
            'settings' => $settings,
            'user' => $user,
            'soldSlots' => $soldSlots,
            'reservedSlots' => $reservedSlots,
            'winners' => $winners,
        ]);
    }
}
