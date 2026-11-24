@extends('layouts.app')

@section('content')
    {{-- Announcement Bar --}}
    @if($announcements->isNotEmpty())
        @php $firstAnnouncement = $announcements->first(); @endphp
        <div class="bg-[#040914] text-white border-b border-amber-500/20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 text-sm">
                <p class="truncate text-slate-200">
                    <strong class="text-white">{{ $firstAnnouncement->title }}</strong>
                    @if($firstAnnouncement->subtitle)
                        — {{ $firstAnnouncement->subtitle }}
                    @endif
                </p>
                <a href="{{ $firstAnnouncement->cta_target ?? '#campaigns' }}" class="text-amber-400 font-semibold shrink-0">
                    {{ $firstAnnouncement->cta_label ?? 'Browse Lotteries' }}
                </a>
            </div>
        </div>
    @endif

    @php
        $hero = $sliderBanners->first();
        $featuredLottery = $lotteries->firstWhere('status', 'active') ?? $lotteries->first();
    @endphp

    {{-- Dark Navy & Gold Slider Banner + 3 Rounded-Rectangular Cards --}}
    <section class="bg-[#060D1E] text-white border-b border-amber-500/20 pt-6 pb-9">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
            {{-- Upgraded Dark Navy & Gold Slider Banner with Live Countdown --}}
            <div class="rounded-3xl border border-amber-500/35 bg-gradient-to-br from-[#0D1A36] via-[#09132A] to-[#060D1E] p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div class="lg:col-span-7">
                    <p class="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">Featured Campaign</p>
                    <h1 class="mt-2.5 text-2xl sm:text-4xl font-bold text-white leading-tight">
                        {{ $hero?->title ?? ($featuredLottery?->name ?? 'Grand Lottery Jackpot') }}
                    </h1>
                    <p class="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                        {{ $hero?->subtitle ?? ($featuredLottery?->details ?? 'Join verified scheduled draws with cryptographic fairness.') }}
                    </p>
                    <a href="{{ $featuredLottery ? route('lotteries.show', ['slug' => $featuredLottery->slug]) : '#campaigns' }}"
                       class="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition-colors">
                        {{ $hero?->cta_label ?? 'Buy Ticket & Enter' }} →
                    </a>
                </div>

                @if($featuredLottery)
                    <div class="lg:col-span-5 rounded-2xl border border-amber-500/30 bg-[#060D1E]/90 p-5 sm:p-6">
                        <div class="flex items-start justify-between border-b border-slate-800 pb-4">
                            <div>
                                <p class="text-xs text-slate-400">Grand Prize Pool</p>
                                <p class="mt-1 font-mono text-2xl sm:text-3xl font-bold text-amber-400">
                                    {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format((float) $featuredLottery->prize_amount, 0) }}
                                </p>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-slate-400">Ticket Fee</p>
                                <p class="mt-1 font-mono text-lg font-bold text-white">
                                    {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format((float) $featuredLottery->entry_fee, 0) }}
                                </p>
                            </div>
                        </div>

                        <div class="mt-4">
                            <p class="text-xs text-slate-300 mb-2.5">Draw Closing Countdown — {{ $featuredLottery->name }}</p>
                            <div id="bladeSliderCountdown" data-end-at="{{ optional($featuredLottery->end_at)->toIso8601String() }}" class="grid grid-cols-4 gap-2.5 text-center">
                                <div class="rounded-xl border border-slate-800 bg-[#0B1730] py-2.5">
                                    <p data-cd="days" class="font-mono text-xl font-bold text-white">00</p>
                                    <p class="text-[10px] uppercase text-amber-400">Days</p>
                                </div>
                                <div class="rounded-xl border border-slate-800 bg-[#0B1730] py-2.5">
                                    <p data-cd="hours" class="font-mono text-xl font-bold text-white">00</p>
                                    <p class="text-[10px] uppercase text-amber-400">Hours</p>
                                </div>
                                <div class="rounded-xl border border-slate-800 bg-[#0B1730] py-2.5">
                                    <p data-cd="mins" class="font-mono text-xl font-bold text-white">00</p>
                                    <p class="text-[10px] uppercase text-amber-400">Mins</p>
                                </div>
                                <div class="rounded-xl border border-slate-800 bg-[#0B1730] py-2.5">
                                    <p data-cd="secs" class="font-mono text-xl font-bold text-white">00</p>
                                    <p class="text-[10px] uppercase text-amber-400">Secs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                @endif
            </div>

            {{-- 3 Rounded-Rectangular Dark Navy & Gold Feature Cards: Lucky Wheel, Shop, Daily Task --}}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="{{ route('rewards.wheel') }}"
                   class="rounded-2xl border border-amber-500/35 bg-gradient-to-r from-[#0D1B38] to-[#081226] hover:border-amber-400 px-5 py-4 flex items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-1">
                    <div>
                        <h2 class="text-base font-bold text-white">Lucky Wheel</h2>
                        <p class="mt-1 text-xs font-mono text-amber-300">Daily Free Spin Ready</p>
                    </div>
                    <span class="text-amber-400 font-bold">→</span>
                </a>

                <a href="{{ route('shop.index') }}"
                   class="rounded-2xl border border-amber-500/35 bg-gradient-to-r from-[#0D1B38] to-[#081226] hover:border-amber-400 px-5 py-4 flex items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-1">
                    <div>
                        <h2 class="text-base font-bold text-white">Shop</h2>
                        <p class="mt-1 text-xs font-mono text-amber-300">Spin &amp; Ticket Bundles</p>
                    </div>
                    <span class="text-amber-400 font-bold">→</span>
                </a>

                <a href="{{ route('rewards.tasks') }}"
                   class="rounded-2xl border border-amber-500/35 bg-gradient-to-r from-[#0D1B38] to-[#081226] hover:border-amber-400 px-5 py-4 flex items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-1">
                    <div>
                        <h2 class="text-base font-bold text-white">Daily Task</h2>
                        <p class="mt-1 text-xs font-mono text-amber-300">4 Daily Missions</p>
                    </div>
                    <span class="text-amber-400 font-bold">→</span>
                </a>
            </div>
        </div>
    </section>

    {{-- All Lotteries Directory Directly Below --}}
    <section id="campaigns" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p class="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold">Verified Draw Pools</p>
        <h2 class="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">All Lotteries</h2>
        <p class="mt-1 text-sm text-slate-600">Select any campaign to buy ticket numbers or inspect verified winner profiles.</p>

        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @forelse($lotteries as $lottery)
                <article class="reveal-up rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 opacity-0 translate-y-4">
                    <div>
                        <div class="flex items-center justify-between text-xs text-slate-500">
                            <span>{{ $lottery->category }}</span>
                            <span class="font-mono font-semibold uppercase">{{ $lottery->status }}</span>
                        </div>
                        <h3 class="mt-2 text-lg font-bold text-slate-900">{{ $lottery->name }}</h3>
                        <p class="mt-2 text-sm text-slate-600">{{ $lottery->details }}</p>
                    </div>
                    <div class="mt-5 pt-4 border-t border-slate-100 space-y-4">
                        <div class="flex items-center justify-between text-sm">
                            <span class="font-mono font-bold text-emerald-700">
                                {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format((float) $lottery->prize_amount, 0) }}
                            </span>
                            <span class="font-mono font-semibold text-slate-900">
                                Ticket: {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format((float) $lottery->entry_fee, 0) }}
                            </span>
                        </div>
                        <a href="{{ route('lotteries.show', ['slug' => $lottery->slug]) }}"
                           class="block w-full text-center rounded-xl {{ $lottery->status === 'drawn' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-white' }} py-2.5 text-sm font-semibold">
                            {{ $lottery->status === 'drawn' ? 'View Winners & Results' : 'Buy Ticket & Details' }}
                        </a>
                    </div>
                </article>
            @empty
                <div class="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                    No lottery campaigns found.
                </div>
            @endforelse
        </div>
    </section>

    <script>
        (function () {
            const cdEl = document.getElementById('bladeSliderCountdown');
            if (cdEl) {
                const targetMs = new Date(cdEl.getAttribute('data-end-at') || '').getTime();
                const updateCd = () => {
                    const diff = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
                    if (Number.isNaN(diff)) return;
                    const d = String(Math.floor(diff / 86400)).padStart(2, '0');
                    const h = String(Math.floor((diff % 86400) / 3600)).padStart(2, '0');
                    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
                    const s = String(diff % 60).padStart(2, '0');
                    cdEl.querySelector('[data-cd="days"]').textContent = d;
                    cdEl.querySelector('[data-cd="hours"]').textContent = h;
                    cdEl.querySelector('[data-cd="mins"]').textContent = m;
                    cdEl.querySelector('[data-cd="secs"]').textContent = s;
                };
                updateCd();
                setInterval(updateCd, 1000);
            }

            const nodes = document.querySelectorAll('.reveal-up');
            const show = (el) => {
                el.classList.remove('opacity-0', 'translate-y-4');
                el.classList.add('opacity-100', 'translate-y-0');
            };
            if ('IntersectionObserver' in window) {
                const io = new IntersectionObserver((entries) => {
                    entries.forEach((entry, idx) => {
                        if (entry.isIntersecting) {
                            setTimeout(() => show(entry.target), idx * 45);
                            io.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });
                nodes.forEach((n) => io.observe(n));
            } else {
                nodes.forEach(show);
            }
        })();
    </script>
@endsection
