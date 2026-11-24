<?php

namespace App\Http\Controllers;

use App\Models\Lottery;
use App\Models\Notification;
use App\Models\Purchase;
use App\Models\Setting;
use App\Models\Ticket;
use App\Models\Transaction;
use App\Models\User;
use App\Services\LotteryDrawService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ShopController extends Controller
{
    public function __construct(private readonly LotteryDrawService $drawService)
    {
    }

    private function catalogItems(): array
    {
        return [
            [
                'id' => 'shop_spin_1',
                'title' => 'Single Lucky Wheel Spin',
                'description' => 'Grants +1 extra Lucky Wheel spin credit usable immediately.',
                'price' => 15.0,
                'kind' => 'spin_pack',
                'spins_granted' => 1,
                'badge_text' => 'Instant Spin',
            ],
            [
                'id' => 'shop_spin_5',
                'title' => '5-Spin Pro Bundle',
                'description' => 'Grants +5 Lucky Wheel spin credits at a 20% bundle discount.',
                'price' => 60.0,
                'kind' => 'spin_pack',
                'spins_granted' => 5,
                'badge_text' => 'Save 20%',
            ],
            [
                'id' => 'shop_ticket_10tk',
                'title' => '10-Taka Fast Draw Entry',
                'description' => 'Instant 1-click official ticket issued into the active 10-Taka Fast Draw.',
                'price' => 10.0,
                'kind' => 'ticket_entry',
                'spins_granted' => 0,
                'badge_text' => 'Instant Ticket',
            ],
            [
                'id' => 'shop_ticket_20tk',
                'title' => '20-Taka Classic Entry',
                'description' => 'Instant 1-click official ticket issued into the active 20-Taka Classic Draw.',
                'price' => 20.0,
                'kind' => 'ticket_entry',
                'spins_granted' => 0,
                'badge_text' => 'Popular',
            ],
        ];
    }

    public function index(Request $request)
    {
        $settings = Setting::pluck('setting_value', 'setting_key');
        $user = $request->user();

        $recentOrders = $user
            ? DB::table('shop_orders')
                ->where('user_id', $user->id)
                ->orderByDesc('created_at')
                ->limit(15)
                ->get()
            : collect();

        return view('shop.index', [
            'settings' => $settings,
            'items' => $this->catalogItems(),
            'user' => $user,
            'recentOrders' => $recentOrders,
        ]);
    }

    public function buy(Request $request)
    {
        $validated = $request->validate([
            'item_id' => ['required', 'string'],
        ]);

        $item = collect($this->catalogItems())->firstWhere('id', $validated['item_id']);
        if (! $item) {
            return back()->withErrors(['shop' => 'Selected Shop bundle was not found.']);
        }

        $authUser = $request->user();

        try {
            $summary = DB::transaction(function () use ($authUser, $item) {
                $user = User::where('id', $authUser->id)->lockForUpdate()->firstOrFail();

                if ((float) $user->balance < $item['price']) {
                    throw new \RuntimeException('Insufficient Main Balance. Please Add Balance from Wallet first.');
                }

                $newBalance = round((float) $user->balance - $item['price'], 2);
                $user->update(['balance' => $newBalance]);

                $rewardSummary = '';
                if ($item['kind'] === 'spin_pack') {
                    $user->increment('spin_credits', $item['spins_granted']);
                    $rewardSummary = "+{$item['spins_granted']} Lucky Wheel Spin Credit(s)";
                } else {
                    $targetFee = $item['id'] === 'shop_ticket_10tk' ? 10.0 : 20.0;
                    $lottery = Lottery::where('status', 'active')
                        ->whereColumn('sold_tickets', '<', 'total_tickets')
                        ->orderByRaw('ABS(entry_fee - ?)', [$targetFee])
                        ->lockForUpdate()
                        ->first();

                    if (! $lottery) {
                        throw new \RuntimeException('No active lottery pool currently has available tickets.');
                    }

                    $soldSlots = Ticket::where('lottery_id', $lottery->id)
                        ->where('status', '!=', 'refunded')
                        ->whereNotNull('slot_number')
                        ->lockForUpdate()
                        ->pluck('slot_number')
                        ->all();

                    $nextSlot = null;
                    for ($s = 1; $s <= $lottery->total_tickets; $s++) {
                        if (! in_array($s, $soldSlots, true)) {
                            $nextSlot = $s;
                            break;
                        }
                    }

                    if ($nextSlot === null) {
                        throw new \RuntimeException('All ticket slots in the active pool are currently claimed.');
                    }

                    $purchase = Purchase::create([
                        'id' => 'pur_' . Str::ulid(),
                        'user_id' => $user->id,
                        'lottery_id' => $lottery->id,
                        'quantity' => 1,
                        'unit_price' => $item['price'],
                        'total_amount' => $item['price'],
                        'status' => 'completed',
                    ]);

                    $ticketNumber = $this->drawService->generateUniqueTicketNumber();
                    Ticket::create([
                        'id' => 'tkt_' . Str::ulid(),
                        'purchase_id' => $purchase->id,
                        'lottery_id' => $lottery->id,
                        'user_id' => $user->id,
                        'ticket_number' => $ticketNumber,
                        'slot_number' => $nextSlot,
                        'entry_fee' => $item['price'],
                        'status' => 'pending',
                        'prize_amount' => 0,
                        'purchased_at' => now(),
                    ]);

                    $lottery->increment('sold_tickets', 1);
                    $rewardSummary = "Ticket {$ticketNumber} in {$lottery->name}";
                }

                $orderId = 'ord_' . Str::ulid();
                DB::table('shop_orders')->insert([
                    'id' => $orderId,
                    'user_id' => $user->id,
                    'item_id' => $item['id'],
                    'item_title' => $item['title'],
                    'amount' => $item['price'],
                    'reward_summary' => $rewardSummary,
                    'created_at' => now(),
                ]);

                Transaction::create([
                    'id' => 'txn_' . Str::ulid(),
                    'user_id' => $user->id,
                    'direction' => 'debit',
                    'category' => 'admin_adjustment',
                    'amount' => $item['price'],
                    'balance_after' => $newBalance,
                    'reference_id' => $orderId,
                    'gateway' => 'Shop',
                    'description' => "Shop order: {$item['title']} ({$rewardSummary})",
                    'created_at' => now(),
                ]);

                Notification::create([
                    'id' => 'notif_' . Str::ulid(),
                    'user_id' => $user->id,
                    'title' => 'Shop Order Completed',
                    'message' => "Purchased {$item['title']} — {$rewardSummary}.",
                    'type' => 'success',
                    'is_read' => false,
                    'created_at' => now(),
                ]);

                return $rewardSummary;
            });
        } catch (\Throwable $e) {
            return back()->withErrors(['shop' => $e->getMessage()]);
        }

        return back()->with('status', "Shop order completed: {$summary}");
    }
}
