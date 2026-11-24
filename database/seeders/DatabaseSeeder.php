<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'Admin'],
            [
                'id' => 'user_admin_1',
                'full_name' => 'System Administrator',
                'email' => 'admin@lotterywinner.app',
                'phone' => '01700000001',
                'password_hash' => Hash::make('Admin123'),
                'role' => 'admin',
                'status' => 'active',
                'balance' => 50000.00,
            ]
        );

        $categories = [
            ['id' => 'cat_1', 'name' => '10 Taka Banner', 'label' => '10 Taka Pool', 'type' => 'single'],
            ['id' => 'cat_2', 'name' => '20 Taka Banner', 'label' => '20 Taka Pool', 'type' => 'multi'],
            ['id' => 'cat_3', 'name' => '50 Taka Banner', 'label' => '50 Taka Pool', 'type' => 'multi'],
            ['id' => 'cat_4', 'name' => '100 Taka Banner', 'label' => '100 Taka VIP', 'type' => 'multi'],
            ['id' => 'cat_5', 'name' => 'Mega Jackpot', 'label' => 'Mega Jackpot', 'type' => 'multi'],
        ];
        foreach ($categories as $cat) {
            Category::updateOrCreate(['id' => $cat['id']], $cat);
        }

        $banners = [
            [
                'id' => 'ban_hero_1',
                'title' => 'Mega Progressive Jackpot — 25,000 Taka Grand Prize Pool',
                'subtitle' => 'Verified cryptographic draws with instant wallet settlement and zero-fee bKash & Nagad withdrawals.',
                'cta_label' => 'Explore All Lotteries',
                'cta_target' => '#campaigns',
                'placement' => 'hero',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'id' => 'ban_hero_2',
                'title' => '10-Taka Fast Cash Daily — Entry Open Now',
                'subtitle' => 'Affordable 10-Taka pools with automatic scheduled draws and instant multi-tier prize distribution.',
                'cta_label' => 'Buy 10-Taka Ticket',
                'cta_target' => '#campaigns',
                'placement' => 'hero',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'id' => 'ban_ann_1',
                'title' => 'Live Announcement: bKash, Nagad, Rocket & Upay MFS Verification Active',
                'subtitle' => 'Submit your transaction ID from your wallet to fund your account.',
                'cta_label' => 'Browse Lotteries',
                'cta_target' => '#campaigns',
                'placement' => 'announcement',
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];
        foreach ($banners as $banner) {
            Banner::updateOrCreate(['id' => $banner['id']], $banner);
        }

        $settings = [
            'site_name' => 'Lottery Winner',
            'currency_symbol' => '৳',
            'mobile_agent_bkash' => '01799228833',
            'mobile_agent_nagad' => '01855221144',
            'mobile_agent_rocket' => '01688554422',
            'mobile_agent_upay' => '01922334455',
        ];
        foreach ($settings as $key => $val) {
            Setting::updateOrCreate(['setting_key' => $key], ['setting_value' => $val]);
        }
    }
}
