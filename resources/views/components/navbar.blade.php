<header class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a href="{{ route('home') }}" class="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            {{ $settings['site_name'] ?? 'Lottery Winner' }}
        </a>

        <nav aria-label="Primary navigation" class="hidden md:flex items-center gap-3">
            <a href="{{ route('home') }}" class="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap">
                Home
            </a>
            <a href="{{ route('campaigns.featured') }}" class="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap">
                Campaigns
            </a>
            <a href="{{ route('profile') }}"
               class="mx-1.5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 whitespace-nowrap">
                Profile
            </a>
            <a href="{{ route('chat') }}" class="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap">
                Chat
            </a>
            <a href="{{ route('wallet') }}" class="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap">
                Wallet
            </a>
        </nav>

        <div class="flex items-center gap-3 shrink-0">
            @auth
                <span class="text-xs font-mono text-slate-600">{{ auth()->user()->username }}</span>
            @else
                <a href="{{ route('profile') }}" class="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 whitespace-nowrap">
                    Sign In
                </a>
            @endauth
        </div>
    </div>
</header>
