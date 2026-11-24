@extends('layouts.app')

@section('title', 'Daily Tasks — ' . ($settings['site_name'] ?? 'Lottery Winner'))

@section('content')
    <section class="bg-slate-950 text-white border-b border-slate-800 py-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
            <div>
                <a href="{{ route('home') }}" class="text-xs font-semibold text-slate-300 hover:text-white">
                    ← Back to Home
                </a>
                <p class="mt-4 text-xs font-mono uppercase tracking-wider text-amber-400">Daily Mission Center</p>
                <h1 class="mt-1 text-3xl font-bold tracking-tight">Daily Tasks &amp; Cash Bonuses</h1>
                <p class="mt-2 text-sm text-slate-300">
                    Complete verified daily player missions to earn instant Taka cash and Lucky Wheel spin credits.
                </p>
            </div>
            <div class="flex items-center gap-3">
                <a href="{{ route('shop.index') }}" class="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200">
                    Open Shop
                </a>
                <a href="{{ route('rewards.wheel') }}" class="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950">
                    Lucky Wheel
                </a>
            </div>
        </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @foreach($tasks as $task)
                <article class="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-4 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
                    <div>
                        <p class="font-mono text-xs font-bold text-emerald-700">
                            +{{ $settings['currency_symbol'] ?? '৳' }}{{ $task['reward_amount'] }}
                            @if($task['reward_spins'] > 0)
                                + {{ $task['reward_spins'] }} Spin
                            @endif
                        </p>
                        <h2 class="mt-2 text-lg font-bold text-slate-900">{{ $task['title'] }}</h2>
                        <p class="mt-1 text-sm text-slate-600">{{ $task['description'] }}</p>
                    </div>
                    <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span class="text-xs text-slate-500">
                            {{ $task['claimed_today'] ? 'Claimed today' : 'Ready when verified' }}
                        </span>
                        <button
                            type="button"
                            data-task-id="{{ $task['id'] }}"
                            @disabled($task['claimed_today'])
                            class="claim-task-btn rounded-xl px-4 py-2 text-xs font-semibold {{ $task['claimed_today'] ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-900 text-white hover:bg-emerald-700' }}"
                        >
                            {{ $task['claimed_today'] ? 'Claimed Today' : 'Claim Reward' }}
                        </button>
                    </div>
                </article>
            @endforeach
        </div>
    </section>

    <script>
        document.querySelectorAll('.claim-task-btn').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const taskId = btn.getAttribute('data-task-id');
                if (!taskId) return;
                const res = await fetch('/api/rewards/tasks/' + encodeURIComponent(taskId) + '/claim', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                    }
                });
                if (res.ok) {
                    btn.textContent = 'Claimed Today';
                    btn.disabled = true;
                }
            });
        });
    </script>
@endsection
