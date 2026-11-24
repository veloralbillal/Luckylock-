@extends('layouts.app')

@section('title', 'Deposit Funds — Mobile Wallet, Crypto, 64-District Agent & Bank')

@section('content')
@php
    $sym = $settings['currency_symbol'] ?? '৳';
    $bkash = $settings['mobile_agent_bkash'] ?? '01799228833';
    $nagad = $settings['mobile_agent_nagad'] ?? '01855221144';
    $rocket = $settings['mobile_agent_rocket'] ?? '01688554422';
    $upay = $settings['mobile_agent_upay'] ?? '01922334455';
    $crypto = $settings['crypto_address'] ?? 'TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X';
    $bank = $settings['bank_details'] ?? 'Dutch-Bangla Bank · Account: 105-110-0048291 · Branch: Motijheel';
    $agentsList = $agents ?? \App\Models\DistrictAgent::directory();
    $districtList = $districts ?? array_values(array_unique(array_column($agentsList, 'district')));
@endphp
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">Deposit Funds</h1>
            <p class="text-xs font-mono text-slate-500">{{ '@' . $user->username }}</p>
        </div>
        <div class="rounded-xl bg-[#0B152B] text-white px-4 py-2 border border-amber-400/25">
            <p class="text-[10px] font-mono uppercase tracking-wider text-amber-300">Main Balance</p>
            <p class="text-base sm:text-lg font-bold font-mono tabular-nums">{{ $sym }}{{ number_format((float)$user->balance, 2) }}</p>
        </div>
    </div>

    <!-- 4 Deposit Method Options -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" id="deposit-category-grid">
        <button type="button" data-cat="mobile_wallet" class="dep-cat-btn rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-amber-400 cursor-pointer">
            <p class="text-sm font-bold text-slate-900">Mobile Wallet</p>
            <p class="text-xs text-slate-500 mt-0.5">bKash, Nagad, Rocket, Upay</p>
        </button>
        <button type="button" data-cat="crypto" class="dep-cat-btn rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-amber-400 cursor-pointer">
            <p class="text-sm font-bold text-slate-900">Crypto</p>
            <p class="text-xs text-slate-500 mt-0.5">USDT (TRC-20)</p>
        </button>
        <button type="button" data-cat="agent" class="dep-cat-btn rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-amber-400 cursor-pointer">
            <p class="text-sm font-bold text-slate-900">Agent</p>
            <p class="text-xs text-slate-500 mt-0.5">64 Districts Cash-In</p>
        </button>
        <button type="button" data-cat="bank" class="dep-cat-btn rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-amber-400 cursor-pointer">
            <p class="text-sm font-bold text-slate-900">Bank</p>
            <p class="text-xs text-slate-500 mt-0.5">Official Bank Transfer</p>
        </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form method="POST" action="{{ url('/api/payments/deposit') }}" id="blade-deposit-form" class="hidden lg:col-span-7 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            @csrf
            <input type="hidden" name="gateway" id="blade-gateway-input" value="bKash">
            <input type="hidden" name="agent_id" id="blade-agent-id-input" value="">
            <div class="px-5 py-4 bg-[#0B152B] text-white border-b border-amber-400/20">
                <h2 class="text-base font-bold text-white" id="blade-dep-title">Deposit</h2>
                <p class="text-[11px] text-slate-300 font-mono">
                    Min {{ $sym }}{{ $settings['min_deposit'] ?? 50 }} · Max {{ $sym }}{{ $settings['max_deposit'] ?? 100000 }}
                </p>
            </div>
            <div class="p-5 sm:p-6 space-y-4">
                <div id="blade-sub-channels" class="hidden">
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Select Mobile Wallet</label>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" id="blade-sub-buttons"></div>
                </div>

                <!-- 64-District Agent Directory -->
                <div id="blade-agent-directory" class="hidden space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <select id="blade-agent-district" class="sm:col-span-5 min-h-[42px] rounded-xl border border-slate-300 px-3 text-xs bg-white">
                            <option value="All">All 64 Districts (Bangladesh)</option>
                            @foreach($districtList as $dist)
                                <option value="{{ $dist }}">{{ $dist }}</option>
                            @endforeach
                        </select>
                        <input type="search" id="blade-agent-search" placeholder="Search district (e.g. Sylhet) or @username..." class="sm:col-span-7 min-h-[42px] rounded-xl border border-slate-300 px-3 text-xs">
                    </div>
                    <div id="blade-agent-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1"></div>
                </div>

                <div class="rounded-xl border border-amber-400/25 bg-[#0B152B] text-white p-4">
                    <p class="text-[11px] text-amber-300 font-medium" id="blade-account-label">Account Details</p>
                    <p class="mt-1 font-mono text-sm sm:text-base font-bold break-all" id="blade-account-value"></p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Amount ({{ $sym }})</label>
                        <input type="number" name="amount" min="{{ $settings['min_deposit'] ?? 50 }}" required class="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono tabular-nums">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Sender Account / Number</label>
                        <input type="text" name="sender_number" required placeholder="017XXXXXXXX" class="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Transaction ID / Reference</label>
                    <input type="text" name="trx_id" required placeholder="e.g. BKA8H2910K" class="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono uppercase">
                </div>
                <button type="submit" class="w-full min-h-[48px] rounded-xl bg-emerald-700 hover:bg-emerald-800 py-3 text-sm font-bold text-white cursor-pointer">
                    Submit Deposit for Verification
                </button>
            </div>
        </form>

        <section class="lg:col-span-5 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div class="px-5 py-3.5 bg-[#0B152B] text-white border-b border-amber-400/20">
                <h3 class="text-sm font-bold text-white">Recent Deposit Requests</h3>
            </div>
            <div class="p-4 sm:p-5 divide-y divide-slate-100">
                @forelse($payments as $p)
                    <div class="py-3 flex items-start justify-between gap-3">
                        <div>
                            <p class="text-sm font-bold text-slate-900">{{ $p->gateway }} · <span class="font-mono">{{ $p->trx_id }}</span></p>
                            <p class="text-xs text-slate-500 font-mono">{{ $p->created_at }}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-mono text-sm font-bold text-emerald-700">+{{ $sym }}{{ number_format((float)$p->amount, 2) }}</p>
                            <p class="text-[11px] font-semibold uppercase text-slate-600">{{ $p->status }}</p>
                        </div>
                    </div>
                @empty
                    <p class="py-6 text-center text-xs text-slate-500">No deposit submissions yet.</p>
                @endforelse
            </div>
        </section>
    </div>
</div>

<script>
(function() {
    const accounts = {
        bKash: @json($bkash),
        Nagad: @json($nagad),
        Rocket: @json($rocket),
        Upay: @json($upay),
        USDT: @json($crypto),
        Bank: @json($bank),
    };
    const agents = @json($agentsList);
    let selectedAgent = agents.find(function(a) { return a.district === 'Sylhet'; }) || agents[0] || null;

    const form = document.getElementById('blade-deposit-form');
    const gwInput = document.getElementById('blade-gateway-input');
    const agentIdInput = document.getElementById('blade-agent-id-input');
    const titleEl = document.getElementById('blade-dep-title');
    const subWrap = document.getElementById('blade-sub-channels');
    const subBtns = document.getElementById('blade-sub-buttons');
    const agentWrap = document.getElementById('blade-agent-directory');
    const agentGrid = document.getElementById('blade-agent-grid');
    const agentDistrict = document.getElementById('blade-agent-district');
    const agentSearch = document.getElementById('blade-agent-search');
    const accLabel = document.getElementById('blade-account-label');
    const accVal = document.getElementById('blade-account-value');

    function setGateway(gw, labelPrefix) {
        gwInput.value = gw;
        agentIdInput.value = '';
        accLabel.textContent = labelPrefix ? gw + ' ' + labelPrefix : gw + ' Account Details';
        accVal.textContent = accounts[gw] || '';
    }

    function selectAgent(agent) {
        selectedAgent = agent;
        gwInput.value = 'Agent';
        agentIdInput.value = agent.id;
        accLabel.textContent = 'Agent @' + agent.username + ' (' + agent.district + ') · ' + agent.totalOrders + ' Orders';
        accVal.textContent = agent.phone;
        renderAgents();
    }

    function renderAgents() {
        const dist = agentDistrict.value;
        const q = (agentSearch.value || '').trim().toLowerCase();
        const filtered = agents.filter(function(a) {
            if (dist !== 'All' && a.district !== dist) return false;
            if (!q) return true;
            return a.district.toLowerCase().includes(q) || a.username.toLowerCase().includes(q) || a.fullName.toLowerCase().includes(q);
        });
        agentGrid.innerHTML = '';
        filtered.forEach(function(a) {
            const active = selectedAgent && selectedAgent.id === a.id;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'w-full text-left rounded-xl border p-3 flex items-start gap-2.5 cursor-pointer ' + (active ? 'border-amber-400 bg-[#0D1A36] text-white' : 'border-slate-200 bg-white text-slate-900');
            btn.innerHTML = '<img src="' + a.avatarUrl + '" alt="' + a.fullName + '" class="w-9 h-9 rounded-full shrink-0">'
                + '<div class="min-w-0 flex-1">'
                + '<p class="font-mono text-xs font-bold truncate ' + (active ? 'text-amber-300' : 'text-slate-900') + '">@' + a.username + '</p>'
                + '<p class="text-[11px] truncate ' + (active ? 'text-slate-200' : 'text-slate-600') + '">' + a.fullName + '</p>'
                + '<div class="flex items-center justify-between text-[11px] mt-1">'
                + '<span class="font-semibold">' + a.district + '</span>'
                + '<span class="font-mono font-bold ' + (active ? 'text-emerald-300' : 'text-emerald-700') + '">' + a.totalOrders + ' Orders</span>'
                + '</div></div>';
            btn.onclick = function() { selectAgent(a); };
            agentGrid.appendChild(btn);
        });
    }

    agentDistrict.addEventListener('change', renderAgents);
    agentSearch.addEventListener('input', renderAgents);

    document.querySelectorAll('.dep-cat-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const cat = btn.getAttribute('data-cat');
            form.classList.remove('hidden');
            subBtns.innerHTML = '';

            if (cat === 'mobile_wallet') {
                titleEl.textContent = 'Mobile Wallet Deposit';
                subWrap.classList.remove('hidden');
                agentWrap.classList.add('hidden');
                ['bKash', 'Nagad', 'Rocket', 'Upay'].forEach(function(gw) {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.textContent = gw;
                    b.className = 'min-h-[42px] px-3 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 cursor-pointer';
                    b.onclick = function() { setGateway(gw, 'Mobile Wallet Number'); };
                    subBtns.appendChild(b);
                });
                setGateway('bKash', 'Mobile Wallet Number');
            } else if (cat === 'agent') {
                titleEl.textContent = '64-District Agent Cash-In';
                subWrap.classList.add('hidden');
                agentWrap.classList.remove('hidden');
                if (selectedAgent) selectAgent(selectedAgent);
            } else if (cat === 'crypto') {
                titleEl.textContent = 'Crypto Deposit';
                subWrap.classList.add('hidden');
                agentWrap.classList.add('hidden');
                setGateway('USDT', 'TRC-20 Address');
            } else {
                titleEl.textContent = 'Bank Deposit';
                subWrap.classList.add('hidden');
                agentWrap.classList.add('hidden');
                setGateway('Bank', 'Account Details');
            }
        });
    });
})();
</script>
@endsection
