@extends('layouts.app')

@section('title', 'Shop Bundles — ' . ($settings['site_name'] ?? 'Lottery Winner'))

@section('content')
    <section class="bg-slate-950 text-white border-b border-slate-800 py-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
            <div>
                <a href="{{ route('home') }}" class="text-xs font-semibold text-slate-300 hover:text-white">
                    ← Back to Home
                </a>
                <p class="mt-4 text-xs font-mono uppercase tracking-wider text-emerald-400">Official Storefront</p>
                <h1 class="mt-1 text-3xl font-bold tracking-tight">Shop Spin Packs &amp; Instant Tickets</h1>
                <p class="mt-2 text-sm text-slate-300">
                    Purchase Lucky Wheel spin bundles and 1-click ticket passes directly from your Main Wallet Balance.
                </p>
            </div>

            <div class="flex items-center gap-3">
                <a href="{{ route('rewards.wheel') }}" class="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-amber-400">
                    Open Lucky Wheel
                </a>
                @if($user)
                    <a href="{{ route('wallet') }}" class="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white">
                        Main Balance: {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format((float) $user->balance, 2) }}
                    </a>
                @endif
            </div>
        </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        @if(session('status'))
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-900">
                {{ session('status') }}
            </div>
        @endif

        @if($errors->has('shop'))
            <div class="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-medium text-rose-800">
                {{ $errors->first('shop') }}
            </div>
        @endif

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @foreach($items as $item)
                <article class="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
                    <div>
                        <div class="flex items-center justify-between text-xs">
                            <span class="font-semibold uppercase text-emerald-700">{{ $item['badge_text'] }}</span>
                            <span class="font-mono font-bold text-slate-900">
                                {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format((float) $item['price'], 0) }}
                            </span>
                        </div>
                        <h2 class="mt-4 text-base font-bold text-slate-900">{{ $item['title'] }}</h2>
                        <p class="mt-2 text-xs text-slate-600 leading-relaxed">{{ $item['description'] }}</p>
                    </div>

                    <form method="POST" action="{{ route('shop.buy') }}" class="mt-6 pt-4 border-t border-slate-100">
                        @csrf
                        <input type="hidden" name="item_id" value="{{ $item['id'] }}">
                        <button type="submit" class="w-full rounded-xl bg-slate-900 hover:bg-emerald-700 py-2.5 px-4 text-xs font-semibold text-white transition-colors">
                            Buy for {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format((float) $item['price'], 0) }}
                        </button>
                    </form>
                </article>
            @endforeach
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 class="text-base font-bold text-slate-900 mb-4">Recent Shop Orders</h2>
            @forelse($recentOrders as $ord)
                <div class="py-3 border-b border-slate-100 last:border-0 flex items-center justify-between text-sm">
                    <div>
                        <p class="font-semibold text-slate-900">{{ $ord->item_title }}</p>
                        <p class="text-xs text-slate-500">{{ $ord->reward_summary }}</p>
                    </div>
                    <span class="font-mono font-bold text-slate-900">
                        {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format((float) $ord->amount, 2) }}
                    </span>
                </div>
            @empty
                <p class="text-sm text-slate-500 py-4">No Shop orders recorded yet.</p>
            @endforelse
        </div>
    </section>
@endsection
