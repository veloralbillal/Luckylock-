@extends('layouts.app')

@section('title', $lottery->name . ' — Lottery Details')

@section('content')
    @php
        $availableTickets = max(0, (int) $lottery->total_tickets - (int) $lottery->sold_tickets);
    @endphp

    <div class="bg-[#060D1E] text-white border-b border-amber-500/20 py-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                <a href="{{ route('home') }}" class="text-xs font-semibold text-slate-300 hover:text-amber-400">
                    ← Back to Home Lotteries
                </a>
                <span class="font-mono text-xs uppercase text-amber-400">
                    {{ $lottery->category }} · {{ $lottery->status === 'drawn' ? 'COMPLETED' : strtoupper($lottery->status) }}
                </span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div class="lg:col-span-7 space-y-4">
                    <h1 class="text-3xl sm:text-4xl font-bold text-white">{{ $lottery->name }}</h1>
                    <p class="text-sm sm:text-base text-slate-300">{{ $lottery->details }}</p>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <div class="rounded-xl border border-amber-500/30 bg-[#0B1730] p-4">
                            <p class="text-xs text-slate-400">Grand Prize</p>
                            <p class="mt-1 font-mono text-lg font-bold text-amber-400">
                                {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format((float) $lottery->prize_amount, 0) }}
                            </p>
                        </div>
                        <div class="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
                            <p class="text-xs text-slate-400">Ticket Price</p>
                            <p class="mt-1 font-mono text-lg font-bold text-white">
                                {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format((float) $lottery->entry_fee, 0) }}
                            </p>
                        </div>
                        <div class="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
                            <p class="text-xs text-slate-400">Sold / Limit</p>
                            <p class="mt-1 font-mono text-lg font-bold text-emerald-400">
                                {{ $lottery->sold_tickets }} / {{ $lottery->total_tickets }}
                            </p>
                        </div>
                        <div class="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
                            <p class="text-xs text-slate-400">Available</p>
                            <p class="mt-1 font-mono text-lg font-bold text-white">{{ $availableTickets }} pcs</p>
                        </div>
                    </div>
                </div>

                @if($lottery->status === 'active')
                    <div class="lg:col-span-5 rounded-2xl border border-amber-500/35 bg-[#0B1730] p-6 space-y-4">
                        <h2 class="text-base font-bold text-white">Wallet Ticket Purchase</h2>
                        <p class="text-xs text-slate-300">
                            Tickets are purchased directly using your Main Wallet Balance ({{ $user ? ($settings['currency_symbol'] ?? '৳') . number_format((float) $user->balance, 2) : 'Sign in required' }}).
                        </p>
                        <form method="POST" action="{{ route('tickets.purchase', ['lotteryId' => $lottery->id]) }}" class="space-y-3">
                            @csrf
                            <input type="hidden" name="payment_method" value="wallet">
                            <div>
                                <label for="qty" class="block text-xs text-slate-400 mb-1">Ticket Quantity (Max {{ min(20, max(1, $availableTickets)) }})</label>
                                <input id="qty" type="number" name="quantity" min="1" max="{{ min(20, max(1, $availableTickets)) }}" value="1"
                                       class="w-full rounded-xl border border-slate-700 bg-[#060D1E] px-3 py-2 text-sm font-mono text-white">
                            </div>
                            <button type="submit" @disabled($availableTickets === 0)
                                    class="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 text-sm transition-colors disabled:opacity-50">
                                {{ $availableTickets === 0 ? 'Sold Out' : 'Buy Ticket via Wallet' }}
                            </button>
                        </form>
                    </div>
                @endif
            </div>
        </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        @if($lottery->status === 'drawn' && $winners->isNotEmpty())
            <section class="rounded-3xl border border-amber-500/35 bg-[#081226] text-white p-6 sm:p-8 space-y-6">
                <h2 class="text-xl font-bold text-white">Official Lottery Winners</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    @foreach($winners as $winner)
                        <div class="rounded-2xl border border-slate-800 bg-[#0B1730] p-5 flex items-center justify-between gap-4">
                            <div class="flex items-center gap-3">
                                <img
                                    src="{{ $winner->user?->avatar_url ?? '/favicon.ico' }}"
                                    alt="{{ $winner->user?->full_name ?? $winner->user?->username }}"
                                    class="w-11 h-11 rounded-full object-cover border-2 border-amber-400/60"
                                >
                                <div>
                                    <p class="text-xs font-mono text-amber-400 font-bold">#{{ $winner->rank_position }} · {{ $winner->prize_title }}</p>
                                    <p class="text-sm font-bold text-white">{{ $winner->user?->full_name ?? $winner->user?->username }}</p>
                                    <p class="text-xs font-mono text-slate-400">{{ '@' . ($winner->user?->username ?? 'player') }} · {{ $winner->ticket_number }}</p>
                                </div>
                            </div>
                            <span class="font-mono font-bold text-emerald-400">
                                {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format((float) $winner->prize_amount, 0) }}
                            </span>
                        </div>
                    @endforeach
                </div>
            </section>
        @endif

        <section class="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100">
                <h2 class="text-base font-bold text-slate-900">Prize Tiers &amp; Payouts</h2>
            </div>
            <table class="w-full text-sm">
                <thead class="bg-slate-50 text-xs text-slate-500">
                    <tr>
                        <th class="py-3 px-5 text-left">Rank</th>
                        <th class="py-3 px-5 text-left">Tier</th>
                        <th class="py-3 px-5 text-right">Winners</th>
                        <th class="py-3 px-5 text-right">Reward</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @foreach($lottery->prizes as $tier)
                        <tr>
                            <td class="py-3 px-5 font-mono font-bold text-amber-700">#{{ $tier->rank_position }}</td>
                            <td class="py-3 px-5 font-medium text-slate-900">{{ $tier->title }}</td>
                            <td class="py-3 px-5 text-right font-mono">{{ $tier->winners_count }}</td>
                            <td class="py-3 px-5 text-right font-mono font-bold text-emerald-700">
                                {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format((float) $tier->amount, 0) }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </section>
    </div>
@endsection
