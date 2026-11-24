@extends('layouts.app')

@section('title', $lottery->name . ' — Campaign Details')

@section('content')
@php
    $sym = $settings['currency_symbol'] ?? '৳';
    $availableCount = max(0, $lottery->total_tickets - $lottery->sold_tickets);
    $progressPct = $lottery->total_tickets > 0 ? min(100, round(($lottery->sold_tickets / $lottery->total_tickets) * 100)) : 0;
@endphp

<div class="min-h-screen bg-[#060D1E] text-slate-100">
    {{-- Sub-bar with Campaign Switcher --}}
    <div class="border-b border-slate-800 bg-[#081226]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <a href="{{ route('home') }}" class="text-xs font-medium text-slate-300 hover:text-amber-400">
                ← Back to Home
            </a>
            <form method="GET" action="{{ route('campaigns.featured') }}" class="flex items-center gap-2">
                <label class="text-xs text-slate-400">Campaign:</label>
                <select onchange="window.location='/campaigns/' + this.value"
                        class="rounded-lg border border-slate-700 bg-[#0B1730] px-3 py-1.5 text-xs text-white">
                    @foreach($allCampaigns as $c)
                        <option value="{{ $c->slug }}" @selected($c->slug === $lottery->slug)>
                            {{ $c->name }} ({{ strtoupper($c->status) }} · {{ $sym }}{{ number_format((float)$c->entry_fee, 0) }})
                        </option>
                    @endforeach
                </select>
            </form>
        </div>
    </div>

    {{-- Sections 1-7: Hero Banner, Title, Grand Prize, KPIs, Progress, Countdown, Dates --}}
    <section class="border-b border-slate-800 bg-[#081226] py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div class="lg:col-span-6 space-y-5">
                    <div class="text-xs text-slate-400">
                        <span class="text-amber-400 font-semibold">{{ $lottery->category }}</span> ·
                        <span>{{ $lottery->draw_mode === 'manual' ? 'Manual Official Draw' : 'Scheduled Auto Draw' }}</span> ·
                        <span class="font-mono uppercase text-emerald-400">{{ $lottery->status }}</span>
                    </div>
                    <h1 class="text-3xl sm:text-5xl font-bold text-white tracking-tight">{{ $lottery->name }}</h1>
                    <p class="text-slate-300 text-sm sm:text-base leading-relaxed">{{ $lottery->details }}</p>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="rounded-xl border border-amber-500/30 bg-[#0B1730] p-4">
                            <p class="text-xs uppercase text-amber-400 font-semibold">Grand Prize Pool</p>
                            <p class="mt-1 text-3xl font-bold text-white font-mono">{{ $sym }}{{ number_format((float)$lottery->prize_amount, 0) }}</p>
                        </div>
                        <div class="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
                            <p class="text-xs text-slate-400 mb-2">Countdown (Days / Hrs / Mins / Secs)</p>
                            <div id="campaign-countdown" data-end="{{ $lottery->end_at->toIso8601String() }}" class="grid grid-cols-4 gap-2 text-center font-mono text-amber-400 font-bold">
                                <div class="rounded bg-[#060D1E] py-1.5"><span data-cd="d">00</span><span class="block text-[10px] text-slate-400">D</span></div>
                                <div class="rounded bg-[#060D1E] py-1.5"><span data-cd="h">00</span><span class="block text-[10px] text-slate-400">H</span></div>
                                <div class="rounded bg-[#060D1E] py-1.5"><span data-cd="m">00</span><span class="block text-[10px] text-slate-400">M</span></div>
                                <div class="rounded bg-[#060D1E] py-1.5"><span data-cd="s">00</span><span class="block text-[10px] text-slate-400">S</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-xl border border-slate-800 bg-[#0B1730] p-4 space-y-2">
                        <div class="flex justify-between text-xs">
                            <span class="text-slate-300">Live Ticket Sales Progress</span>
                            <span class="font-mono text-amber-400">{{ $progressPct }}% Sold</span>
                        </div>
                        <div class="h-2.5 rounded-full bg-slate-900 overflow-hidden">
                            <div class="h-full bg-amber-500" style="width: {{ $progressPct }}%"></div>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-6 rounded-2xl border border-amber-500/25 bg-[#0B1730] p-8 flex flex-col justify-between">
                    <div class="flex justify-between text-xs text-amber-300">
                        <span>{{ $lottery->category }} · Prize Showcase</span>
                        <span class="font-mono">SHA-256 Verified</span>
                    </div>
                    <div class="pt-24">
                        <p class="text-xs uppercase text-amber-400 font-semibold">Grand Prize Allocation</p>
                        <p class="mt-1 text-4xl font-bold text-white font-mono">{{ $sym }}{{ number_format((float)$lottery->prize_amount, 0) }}</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
                    <p class="text-xs text-slate-400">Ticket Price</p>
                    <p class="mt-1 text-2xl font-bold text-amber-400 font-mono">{{ $sym }}{{ number_format((float)$lottery->entry_fee, 0) }}</p>
                </div>
                <div class="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
                    <p class="text-xs text-slate-400">Total Tickets</p>
                    <p class="mt-1 text-2xl font-bold text-white font-mono">{{ number_format($lottery->total_tickets) }}</p>
                </div>
                <div class="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
                    <p class="text-xs text-slate-400">Sold Tickets</p>
                    <p class="mt-1 text-2xl font-bold text-emerald-400 font-mono">{{ number_format($lottery->sold_tickets) }}</p>
                </div>
                <div class="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
                    <p class="text-xs text-slate-400">Available Tickets</p>
                    <p class="mt-1 text-2xl font-bold text-white font-mono">{{ number_format($availableCount) }}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-slate-800 bg-[#060D1E] p-4 text-xs">
                <div><span class="text-slate-400">Start Date:</span> <strong class="font-mono text-white">{{ $lottery->start_at->format('M d, Y H:i') }}</strong></div>
                <div><span class="text-slate-400">Closing Date:</span> <strong class="font-mono text-white">{{ $lottery->end_at->format('M d, Y H:i') }}</strong></div>
                <div><span class="text-slate-400">Draw Date:</span> <strong class="font-mono text-amber-300">{{ ($lottery->drawn_at ?? $lottery->end_at)->format('M d, Y H:i') }}</strong></div>
            </div>
        </div>
    </section>

    {{-- Completed Lottery All Winners Showcase --}}
    @if($lottery->status === 'drawn' && $lottery->result)
        <section class="border-b border-amber-500/25 bg-[#0B1730] py-10">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div>
                    <p class="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">Official Draw Completed</p>
                    <h2 class="mt-1 text-2xl font-bold text-white">Verified Lottery Winners ({{ $lottery->result->winners->count() }})</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    @foreach($lottery->result->winners as $winner)
                        <article class="rounded-2xl border border-slate-800 bg-[#060D1E] p-5 space-y-4">
                            <div class="flex items-center gap-4">
                                <img src="{{ $winner->user->avatar_url ?? '' }}"
                                     alt="{{ $winner->user->username ?? 'Winner' }}"
                                     class="w-14 h-14 rounded-full object-cover border-2 border-amber-400/70 bg-slate-800">
                                <div>
                                    <p class="text-xs font-semibold text-amber-400">#{{ $winner->rank_position }} · {{ $winner->prize_title }}</p>
                                    <h3 class="text-base font-bold text-white">{{ $winner->user->full_name ?? $winner->user->username ?? 'Player' }}</h3>
                                    <p class="text-xs font-mono text-slate-300">@{{ $winner->user->username ?? 'player' }}</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between pt-3 border-t border-slate-800">
                                <span class="font-mono text-xs text-slate-300">{{ $winner->ticket_number }}</span>
                                <span class="font-mono text-xl font-bold text-emerald-400">{{ $sym }}{{ number_format((float)$winner->prize_amount, 0) }}</span>
                            </div>
                        </article>
                    @endforeach
                </div>
            </div>
        </section>
    @endif

    {{-- Sections 8-14: Interactive Ticket Grid & Sticky Purchase Summary --}}
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div class="lg:col-span-8 rounded-2xl border border-slate-800 bg-[#0B1730] p-6 space-y-5">
                <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <h2 class="text-xl font-bold text-white">Interactive Ticket Number Grid</h2>
                    <button type="button" id="btn-random-pick" class="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950">
                        Random Pick
                    </button>
                </div>
                <div class="flex flex-wrap gap-4 text-xs text-slate-300">
                    <span>Available</span> · <span class="text-amber-400">Selected</span> · <span class="text-amber-200">Reserved</span> · <span class="text-slate-500">Sold</span>
                </div>
                <div id="laravel-ticket-grid" class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    @foreach($slots as $slot)
                        <button type="button"
                                data-slot="{{ $slot['slotNumber'] }}"
                                data-state="{{ $slot['state'] }}"
                                @disabled($slot['state'] !== 'available' && !$slot['reservedByMe'])
                                class="slot-btn h-10 rounded-lg border font-mono text-xs {{ $slot['state'] === 'sold' ? 'border-slate-800 bg-slate-900 text-slate-600 line-through' : ($slot['state'] === 'reserved' ? 'border-amber-500/40 bg-amber-950/40 text-amber-300' : 'border-slate-700 bg-[#060D1E] text-slate-200 hover:border-amber-400') }}">
                            {{ $slot['label'] }}
                        </button>
                    @endforeach
                </div>
            </div>

            <aside class="lg:col-span-4 lg:sticky lg:top-20 rounded-2xl border border-amber-500/30 bg-[#0B1730] p-6 space-y-4">
                <h3 class="text-lg font-bold text-white">Purchase Summary</h3>
                <div class="text-xs text-slate-400">Selected Numbers: <span id="summary-slots" class="font-mono text-amber-300">None</span></div>
                <div class="flex justify-between text-sm border-y border-slate-800 py-3">
                    <span class="text-slate-300">Total Payable</span>
                    <span id="summary-total" data-fee="{{ $lottery->entry_fee }}" class="font-mono text-xl font-bold text-amber-400">{{ $sym }}0</span>
                </div>
                <button type="button" id="btn-checkout" class="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950">
                    Confirm &amp; Lock Tickets
                </button>
                <div id="checkout-feedback" class="text-xs text-slate-300"></div>
            </aside>
        </div>
    </section>

    {{-- Sections 15-19: Prize Table, Rules, Winner Announcement, Previous Winners, FAQ --}}
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <div class="rounded-2xl border border-slate-800 bg-[#0B1730] p-6">
            <h2 class="text-xl font-bold text-white mb-4">Prize Breakdown</h2>
            <table class="w-full text-sm">
                <thead class="text-xs text-slate-400 border-b border-slate-800">
                    <tr><th class="py-2 text-left">Rank</th><th class="py-2 text-left">Tier</th><th class="py-2 text-right">Reward</th></tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                    @foreach($lottery->prizes as $tier)
                        <tr>
                            <td class="py-2.5 font-mono text-amber-400">#{{ $tier->rank_position }}</td>
                            <td class="py-2.5 text-white">{{ $tier->title }}</td>
                            <td class="py-2.5 text-right font-mono font-bold text-emerald-400">{{ $sym }}{{ number_format((float)$tier->amount, 0) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="rounded-2xl border border-slate-800 bg-[#0B1730] p-6 space-y-2">
                <h2 class="text-xl font-bold text-white">Campaign Rules &amp; Conditions</h2>
                <p class="text-sm text-slate-300">01. Reservations lock chosen numbers atomically for 5 minutes.</p>
                <p class="text-sm text-slate-300">02. Ticket totals are computed strictly on the server.</p>
                <p class="text-sm text-slate-300">03. Manual MFS payments require TrxID verification before ticket issuance.</p>
            </div>
            <div class="rounded-2xl border border-slate-800 bg-[#0B1730] p-6 space-y-2">
                <h2 class="text-xl font-bold text-white">Previous Verified Winners</h2>
                @forelse($previousWinners as $pw)
                    <div class="flex justify-between text-xs py-1.5 border-b border-slate-800">
                        <span class="font-mono text-white">{{ $pw->ticket_number }} ({{ $pw->lottery->name ?? '' }})</span>
                        <span class="font-mono text-emerald-400">{{ $sym }}{{ number_format((float)$pw->prize_amount, 0) }}</span>
                    </div>
                @empty
                    <p class="text-xs text-slate-400">No previous winners recorded yet.</p>
                @endforelse
            </div>
        </div>
    </section>
</div>

<script>
(() => {
    const selected = new Set();
    const grid = document.getElementById('laravel-ticket-grid');
    const summarySlots = document.getElementById('summary-slots');
    const summaryTotal = document.getElementById('summary-total');
    const fee = Number(summaryTotal?.dataset.fee || 0);
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';

    const refreshSummary = () => {
        const list = Array.from(selected).sort((a, b) => a - b);
        summarySlots.textContent = list.length ? list.map(n => '#' + n).join(', ') : 'None';
        summaryTotal.textContent = '{{ $sym }}' + (list.length * fee).toLocaleString();
    };

    grid?.addEventListener('click', (e) => {
        const btn = e.target.closest('.slot-btn');
        if (!btn || btn.disabled) return;
        const num = Number(btn.dataset.slot);
        if (selected.has(num)) {
            selected.delete(num);
            btn.classList.remove('bg-amber-500', 'text-slate-950');
        } else if (selected.size < 20) {
            selected.add(num);
            btn.classList.add('bg-amber-500', 'text-slate-950');
        }
        refreshSummary();
    });

    document.getElementById('btn-random-pick')?.addEventListener('click', () => {
        const avail = Array.from(document.querySelectorAll('.slot-btn:not([disabled])'));
        if (!avail.length) return;
        const pick = avail[Math.floor(Math.random() * avail.length)];
        pick.click();
    });

    document.getElementById('btn-checkout')?.addEventListener('click', async () => {
        const list = Array.from(selected);
        if (!list.length) return;
        const res = await fetch('/lotteries/{{ $lottery->id }}/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
            body: JSON.stringify({ slot_numbers: list, payment_method: 'wallet' })
        });
        const data = await res.json();
        document.getElementById('checkout-feedback').textContent = data.message || (data.success ? 'Tickets purchased.' : 'Sign in required.');
    });
})();
</script>
@endsection
