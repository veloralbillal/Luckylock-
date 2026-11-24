<?php

namespace App\Http\Controllers;

use App\Models\DistrictAgent;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\Transaction;
use App\Models\Withdrawal;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $settings = Setting::pluck('setting_value', 'setting_key');

        $payments = Payment::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(30)
            ->get();

        $withdrawals = Withdrawal::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(30)
            ->get();

        $transactions = Transaction::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return view('wallet', [
            'user' => $user,
            'settings' => $settings,
            'payments' => $payments,
            'withdrawals' => $withdrawals,
            'transactions' => $transactions,
        ]);
    }

    public function deposit(Request $request)
    {
        $user = $request->user();
        $settings = Setting::pluck('setting_value', 'setting_key');
        $agents = DistrictAgent::directory();
        $districts = array_values(array_unique(array_column($agents, 'district')));
        sort($districts);

        $payments = Payment::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return view('wallet-deposit', [
            'user' => $user,
            'settings' => $settings,
            'payments' => $payments,
            'agents' => $agents,
            'districts' => $districts,
        ]);
    }

    public function withdraw(Request $request)
    {
        $user = $request->user();
        $settings = Setting::pluck('setting_value', 'setting_key');
        $agents = DistrictAgent::directory();
        $districts = array_values(array_unique(array_column($agents, 'district')));
        sort($districts);

        $withdrawals = Withdrawal::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return view('wallet-withdraw', [
            'user' => $user,
            'settings' => $settings,
            'withdrawals' => $withdrawals,
            'agents' => $agents,
            'districts' => $districts,
        ]);
    }
}
