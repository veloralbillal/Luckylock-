<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Lottery;
use App\Models\LotteryResult;
use App\Models\Setting;
use App\Models\Winner;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $announcements = Banner::where('is_active', true)
            ->where('placement', 'announcement')
            ->orderBy('sort_order')
            ->get();

        $sliderBanners = Banner::where('is_active', true)
            ->where('placement', 'hero')
            ->orderBy('sort_order')
            ->get();

        $categories = Category::orderBy('name')->get();

        // Home page displays ALL lotteries by default
        $lotteriesQuery = Lottery::with('prizes')->orderByDesc('created_at');
        if ($request->filled('category') && $request->string('category')->toString() !== 'all') {
            $lotteriesQuery->where('category', $request->string('category')->toString());
        }
        $lotteries = $lotteriesQuery->get();

        $results = LotteryResult::with(['lottery', 'winners.user'])
            ->where('is_published', true)
            ->orderByDesc('drawn_at')
            ->limit(10)
            ->get();

        $settings = Setting::pluck('setting_value', 'setting_key');

        return view('home', [
            'announcements' => $announcements,
            'sliderBanners' => $sliderBanners,
            'categories' => $categories,
            'lotteries' => $lotteries,
            'results' => $results,
            'settings' => $settings,
            'stats' => [
                'totalCampaigns' => Lottery::count(),
                'activeCampaigns' => Lottery::where('status', 'active')->count(),
                'totalTicketsIssued' => (int) Lottery::sum('sold_tickets'),
                'totalWinners' => Winner::count(),
                'totalPrizesAwarded' => (float) Winner::sum('prize_amount'),
            ],
        ]);
    }
}
