@extends('layouts.app')

@section('title', 'Withdraw — Mobile Wallet, Crypto, 64-District Agent & Bank')

@section('content')
@php
    $sym = $settings['currency_symbol'] ?? '৳';
    $agentsList = $agents ?? \App\Models\DistrictAgent::directory();
    $districtList = $districts ?? array_values(array_unique(array_column($agentsList, 'district')));
@endphp
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">Withdraw</h1>
            <p class="text-xs font-mono text-slate-500">{{ '@' . $user->username }}</p>
        </div>
        <div class="rounded-xl bg-[#0B152B] text-white px-4 py-2 border border-amber-400/25">
            <p class="text-[10px] font-mono uppercase tracking-wider text-amber-300">Main Balance</p>
            <p class="text-base sm:text-lg font-bold font-mono tabular-nums">{{ $sym }}{{ number_format((float)$user->balance, 2) }}</p>
        </div>
    </div>

    <!-- 4 Withdraw Method Options -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button type="button" data-wd-cat="mobile_wallet" class="wd-cat-btn rounded-2xl border border-amber-400 bg-[#0D1A36] text-white p-4 text-left cursor-pointer">
            <p class="text-sm font-bold">Mobile Wallet</p>
            <p class="text-xs text-amber-300 mt-0.5">bKash, Nagad, Rocket, Upay</p>
        </button>
        <button type="button" data-wd-cat="crypto" class="wd-cat-btn rounded-2xl border border-slate-200 bg-white text-slate-900 p-4 text-left hover:border-amber-400 cursor-pointer">
            <p class="text-sm font-bold">Crypto</p>
            <p class="text-xs text-slate-500 mt-0.5">USDT (TRC-20)</p>
        </button>
        <button type="button" data-wd-cat="agent" class="wd-cat-btn rounded-2xl border border-slate-200 bg-white text-slate-900 p-4 text-left hover:border-amber-400 cursor-pointer">
            <p class="text-sm font-bold">Agent</p>
            <p class="text-xs text-slate-500 mt-0.5">64 Districts Cash-Out</p>
        </button>
        <button type="button" data-wd-cat="bank" class="wd-cat-btn rounded-2xl border border-slate-200 bg-white text-slate-900 p-4 text-left hover:border-amber-400 cursor-pointer">
            <p class="text-sm font-bold">Bank</p>
            <p class="text-xs text-slate-500 mt-0.5">Bank Account Payout</p>
        </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form method="POST" action="{{ url('/api/withdrawals') }}" class="lg:col-span-7 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            @csrf
            <input type="hidden" name="agent_id" id="wd-agent-id-input" value="">
            <div class="px-5 py-4 bg-[#0B152B] text-white border-b border-amber-400/20">
                <h2 class="text-base font-bold text-white" id="wd-form-title">Mobile Wallet Payout</h2>
                <p class="text-[11px] text-slate-300 font-mono">
                    Min {{ $sym }}{{ $settings['min_withdrawal'] ?? 100 }} · Fee {{ $settings['withdrawal_fee_percent'] ?? 0 }}%
                </p>
            </div>
            <div class="p-5 sm:p-6 space-y-4">
                <div id="wd-gateway-wrap">
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Payout Channel</label>
                    <select name="gateway" id="wd-gateway-select" class="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white">
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Rocket">Rocket</option>
                        <option value="Upay">Upay</option>
                        <option value="Bank">Bank Transfer</option>
                        <option value="USDT">USDT (TRC-20)</option>
                        <option value="Agent">District Agent (64 Districts)</option>
                    </select>
                </div>

                <!-- 64-District Agent Directory for Cash-Out -->
                <div id="wd-agent-directory" class="hidden space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <select id="wd-agent-district" class="sm:col-span-5 min-h-[42px] rounded-xl border border-slate-300 px-3 text-xs bg-white">
                            <option value="All">All 64 Districts (Bangladesh)</option>
                            @foreach($districtList as $dist)
                                <option value="{{ $dist }}">{{ $dist }}</option>
                            @endforeach
                        </select>
                        <input type="search" id="wd-agent-search" placeholder="Search district (e.g. Sylhet) or @username..." class="sm:col-span-7 min-h-[42px] rounded-xl border border-slate-300 px-3 text-xs">
                    </div>
                    <div id="wd-agent-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1"></div>
                    <div id="wd-agent-summary" class="rounded-xl border border-amber-400/25 bg-[#0B152B] text-white p-3.5 text-xs"></div>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Recipient Account / Number</label>
                    <input type="text" name="target_account" required placeholder="017XXXXXXXX" class="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Amount ({{ $sym }})</label>
                    <input type="number" name="amount" min="{{ $settings['min_withdrawal'] ?? 100 }}" required class="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono tabular-nums">
                </div>
                @if(!empty($user->pin_lock_enabled))
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">4-Digit Security PIN</label>
                        <input type="password" name="security_pin" maxlength="4" required placeholder="••••" class="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono">
                    </div>
                @endif
                <button type="submit" class="w-full min-h-[48px] rounded-xl bg-[#0D1A36] hover:bg-slate-900 py-3 text-sm font-bold text-amber-300 cursor-pointer">
                    Submit Withdrawal Request
                </button>
            </div>
        </form>

        <section class="lg:col-span-5 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div class="px-5 py-3.5 bg-[#0B152B] text-white border-b border-amber-400/20">
                <h3 class="text-sm font-bold text-white">Recent Withdrawal Requests</h3>
            </div>
            <div class="p-4 sm:p-5 divide-y divide-slate-100">
                @forelse($withdrawals as $w)
                    <div class="py-3 flex items-start justify-between gap-3">
                        <div>
                            <p class="text-sm font-bold text-slate-900">{{ $w->gateway }} · <span class="font-mono">{{ $w->target_account }}</span></p>
                            <p class="text-xs text-slate-500 font-mono">{{ $w->created_at }}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-mono text-sm font-bold text-slate-900">-{{ $sym }}{{ number_format((float)$w->amount, 2) }}</p>
                            <p class="text-[11px] font-semibold uppercase text-slate-600">{{ $w->status }}</p>
                        </div>
                    </div>
                @empty
                    <p class="py-6 text-center text-xs text-slate-500">No withdrawal requests submitted yet.</p>
                @endforelse
            </div>
        </section>
    </div>
</div>

<script>
(function() {
    const agents = @json($agentsList);
    let selectedAgent = agents.find(function(a) { return a.district === 'Sylhet'; }) || agents[0] || null;

    const gwSelect = document.getElementById('wd-gateway-select');
    const agentIdInput = document.getElementById('wd-agent-id-input');
    const formTitle = document.getElementById('wd-form-title');
    const agentWrap = document.getElementById('wd-agent-directory');
    const agentGrid = document.getElementById('wd-agent-grid');
    const agentDistrict = document.getElementById('wd-agent-district');
    const agentSearch = document.getElementById('wd-agent-search');
    const agentSummary = document.getElementById('wd-agent-summary');

    function selectAgent(a) {
        selectedAgent = a;
        agentIdInput.value = a.id;
        gwSelect.value = 'Agent';
        agentSummary.innerHTML = '<p class="font-mono font-bold text-amber-300">@' + a.username + ' · ' + a.district + ' District</p>'
            + '<p class="mt-0.5 text-slate-200">' + a.fullName + ' · ' + a.totalOrders + ' Orders · Contact: <span class="font-mono font-bold text-white">' + a.phone + '</span></p>';
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

    document.querySelectorAll('.wd-cat-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const cat = btn.getAttribute('data-wd-cat');
            document.querySelectorAll('.wd-cat-btn').forEach(function(b) {
                b.className = 'wd-cat-btn rounded-2xl border border-slate-200 bg-white text-slate-900 p-4 text-left hover:border-amber-400 cursor-pointer';
            });
            btn.className = 'wd-cat-btn rounded-2xl border border-amber-400 bg-[#0D1A36] text-white p-4 text-left cursor-pointer';

            if (cat === 'agent') {
                formTitle.textContent = '64-District Agent Cash-Out';
                agentWrap.classList.remove('hidden');
                if (selectedAgent) selectAgent(selectedAgent);
            } else {
                agentWrap.classList.add('hidden');
                agentIdInput.value = '';
                if (cat === 'mobile_wallet') {
                    formTitle.textContent = 'Mobile Wallet Payout';
                    gwSelect.value = 'bKash';
                } else if (cat === 'crypto') {
                    formTitle.textContent = 'Crypto Payout';
                    gwSelect.value = 'USDT';
                } else {
                    formTitle.textContent = 'Bank Payout';
                    gwSelect.value = 'Bank';
                }
            }
        });
    });
})();
</script>
@endsection
