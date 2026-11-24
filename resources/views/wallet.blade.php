@extends('layouts.app')

@section('title', 'Wallet — Main Balance & History')

@section('content')
@php
    $sym = $settings['currency_symbol'] ?? '৳';
    $totalIn = collect($transactions)->where('direction', 'credit')->sum('amount');
    $totalOut = collect($transactions)->where('direction', 'debit')->sum('amount');
@endphp
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 space-y-6">
    <!-- Main Balance Hero -->
    <section class="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-[#060D1E] via-[#0D1A36] to-[#112247] text-white p-5 sm:p-7 shadow-lg">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
                <p class="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">Main Balance</p>
                <p class="mt-2 text-3xl sm:text-5xl font-bold font-mono tabular-nums">
                    {{ $sym }}{{ number_format((float)$user->balance, 2) }}
                </p>
                <p class="mt-1.5 text-xs sm:text-sm text-slate-300">
                    Available for lottery tickets, Shop bundles, and verified cashouts.
                </p>
            </div>

            <div class="grid grid-cols-2 gap-3 lg:w-[420px] shrink-0">
                <div class="rounded-xl border border-white/10 bg-slate-950/50 p-3.5 sm:p-4">
                    <p class="text-[11px] text-slate-400">Total Added (+)</p>
                    <p class="mt-1 font-mono text-lg sm:text-xl font-bold text-emerald-400 tabular-nums">
                        +{{ $sym }}{{ number_format((float)$totalIn, 2) }}
                    </p>
                </div>
                <div class="rounded-xl border border-white/10 bg-slate-950/50 p-3.5 sm:p-4">
                    <p class="text-[11px] text-slate-400">Total Spent / Out (-)</p>
                    <p class="mt-1 font-mono text-lg sm:text-xl font-bold text-rose-400 tabular-nums">
                        -{{ $sym }}{{ number_format((float)$totalOut, 2) }}
                    </p>
                </div>
                <div class="rounded-xl border border-white/10 bg-slate-950/50 p-3.5 sm:p-4">
                    <p class="text-[11px] text-slate-400">Approved Deposits</p>
                    <p class="mt-1 font-mono text-base sm:text-lg font-bold text-white tabular-nums">
                        {{ $sym }}{{ number_format((float)$user->total_deposited, 0) }}
                    </p>
                </div>
                <div class="rounded-xl border border-white/10 bg-slate-950/50 p-3.5 sm:p-4">
                    <p class="text-[11px] text-slate-400">Total Withdrawn</p>
                    <p class="mt-1 font-mono text-base sm:text-lg font-bold text-white tabular-nums">
                        {{ $sym }}{{ number_format((float)$user->total_withdrawn, 0) }}
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Left (Deposit) & Right (Withdraw) Options -> Separate Pages -->
    <section class="grid grid-cols-2 gap-3 sm:gap-5">
        <a href="{{ route('wallet.deposit') }}" class="rounded-2xl border border-amber-400/25 bg-[#0B152B] hover:bg-[#112042] text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors shadow-xs">
            <div class="min-w-0">
                <h2 class="text-sm sm:text-lg font-bold text-white">Deposit</h2>
                <p class="hidden sm:block text-xs text-slate-300 mt-0.5">Add balance on dedicated deposit page</p>
            </div>
            <span class="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shrink-0 whitespace-nowrap">
                Deposit &rarr;
            </span>
        </a>

        <a href="{{ route('wallet.withdraw') }}" class="rounded-2xl border border-amber-400/25 bg-[#0B152B] hover:bg-[#112042] text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors shadow-xs">
            <div class="min-w-0">
                <h2 class="text-sm sm:text-lg font-bold text-white">Withdraw</h2>
                <p class="hidden sm:block text-xs text-slate-300 mt-0.5">Request payout on dedicated withdraw page</p>
            </div>
            <span class="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-amber-300 text-xs sm:text-sm font-bold shrink-0 whitespace-nowrap">
                Withdraw &rarr;
            </span>
        </a>
    </section>

    <!-- Full-Width Wallet History -->
    <section class="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div class="bg-[#0B152B] text-white px-5 py-4 sm:px-6 border-b border-amber-400/20 flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-bold text-white">Wallet History</h2>
            <div class="flex items-center gap-3 text-xs font-mono tabular-nums">
                <span class="text-emerald-400 font-semibold">In: +{{ $sym }}{{ number_format((float)$totalIn, 2) }}</span>
                <span class="text-slate-500">·</span>
                <span class="text-rose-400 font-semibold">Out: -{{ $sym }}{{ number_format((float)$totalOut, 2) }}</span>
            </div>
        </div>

        <div class="p-4 sm:p-6 divide-y divide-slate-100">
            @forelse($transactions as $txn)
                <div class="py-3.5 flex items-start justify-between gap-4">
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-slate-900">{{ $txn->description }}</p>
                        <p class="mt-0.5 text-xs text-slate-500 font-mono">
                            {{ ucfirst(str_replace('_', ' ', $txn->category ?? 'wallet')) }} · {{ $txn->created_at }}
                        </p>
                    </div>
                    <div class="text-right shrink-0">
                        <p class="font-mono text-sm font-bold tabular-nums {{ $txn->direction === 'credit' ? 'text-emerald-700' : 'text-rose-600' }}">
                            {{ $txn->direction === 'credit' ? '+' : '-' }}{{ $sym }}{{ number_format((float)$txn->amount, 2) }}
                        </p>
                        @if(isset($txn->balance_after))
                            <p class="mt-0.5 text-[11px] font-mono text-slate-500 tabular-nums">
                                Bal: {{ $sym }}{{ number_format((float)$txn->balance_after, 2) }}
                            </p>
                        @endif
                    </div>
                </div>
            @empty
                <p class="py-8 text-center text-sm text-slate-500">No balance transactions yet.</p>
            @endforelse
        </div>
    </section>
</div>
@endsection
