@extends('layouts.app')

@section('title', 'Lucky Wheel — ' . ($settings['site_name'] ?? 'Lottery Winner'))

@section('content')
    <div class="min-h-screen bg-[#060D1E] text-white py-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <a href="{{ route('home') }}" class="text-xs font-semibold text-slate-300 hover:text-white">
                    ← Back to Home
                </a>
                <a href="{{ route('shop.index') }}" class="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-amber-400">
                    Buy Spin Credits in Shop
                </a>
            </div>

            <div class="rounded-3xl border border-slate-800 bg-[#081226] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div class="lg:col-span-6 space-y-4">
                    <p class="text-xs font-mono uppercase tracking-wider text-amber-400">CSPRNG Prize Wheel</p>
                    <h1 class="text-3xl font-bold text-white">Daily Lucky Wheel</h1>
                    <p class="text-sm text-slate-300 leading-relaxed">
                        Every signed-in player receives 1 Free Daily Spin every calendar day plus any extra spin credits purchased in the Shop.
                    </p>

                    <div class="grid grid-cols-2 gap-4 pt-2">
                        <div class="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
                            <p class="text-xs text-slate-400">Free Daily Spin</p>
                            <p class="mt-1 font-mono text-lg font-bold text-emerald-400">
                                {{ $user ? ($canUseFreeDailySpin ? '1 Available' : 'Used Today') : 'Sign In' }}
                            </p>
                        </div>
                        <div class="rounded-xl border border-slate-800 bg-[#0B1730] p-4">
                            <p class="text-xs text-slate-400">Extra Spin Credits</p>
                            <p class="mt-1 font-mono text-lg font-bold text-amber-400">
                                {{ $user ? (int) ($user->spin_credits ?? 0) : 0 }} Credits
                            </p>
                        </div>
                    </div>

                    <button type="button" id="spinBtn" class="mt-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 text-sm transition-colors">
                        Spin Lucky Wheel
                    </button>
                    <p id="spinOutcome" class="text-sm font-mono text-emerald-400 hidden"></p>
                </div>

                <div class="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    @foreach($segments as $seg)
                        <div class="rounded-xl border border-slate-800 bg-[#0B1730] p-3">
                            <span class="inline-block w-3 h-3 rounded-full mb-2" style="background-color: {{ $seg['color'] }}"></span>
                            <p class="font-mono text-xs font-bold text-white">{{ $seg['label'] }}</p>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('spinBtn')?.addEventListener('click', async function () {
            const out = document.getElementById('spinOutcome');
            try {
                const res = await fetch('/api/rewards/wheel/spin', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                    }
                });
                const data = await res.json();
                if (out) {
                    out.classList.remove('hidden');
                    out.textContent = data.success
                        ? 'Won: ' + (data.segment?.label || 'Reward') + ' (New Balance: ৳' + data.balance + ')'
                        : (data.message || 'Sign in or purchase spin credits in Shop.');
                }
            } catch {
                if (out) {
                    out.classList.remove('hidden');
                    out.textContent = 'Please sign in first to spin the Lucky Wheel.';
                }
            }
        });
    </script>
@endsection
