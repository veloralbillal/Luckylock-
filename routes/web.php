<?php

use App\Http\Controllers\CampaignController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LotteryDetailsController;
use App\Http\Controllers\RewardsController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;

// Home displays All Lotteries, Announcements, Slider Banners, and Feature Launchers
Route::get('/', [HomeController::class, 'index'])->name('home');

// Dedicated Lottery Details Page opened from Home
Route::get('/lotteries/{slug}', [LotteryDetailsController::class, 'show'])->name('lotteries.show');

// Separate Feature Pages: Shop, Lucky Wheel, Daily Tasks
Route::get('/shop', [ShopController::class, 'index'])->name('shop.index');
Route::get('/lucky-wheel', [RewardsController::class, 'wheelPage'])->name('rewards.wheel');
Route::get('/daily-tasks', [RewardsController::class, 'tasksPage'])->name('rewards.tasks');

// Campaign Details Page loaded dynamically by slug
Route::get('/campaigns', [CampaignController::class, 'featured'])->name('campaigns.featured');
Route::get('/campaigns/{slug}', [CampaignController::class, 'show'])->name('campaigns.show');

Route::middleware('auth')->group(function () {
    Route::view('/profile', 'home')->name('profile');
    Route::view('/chat', 'home')->name('chat');
    Route::get('/wallet', [WalletController::class, 'index'])->name('wallet');
    Route::get('/wallet/deposit', [WalletController::class, 'deposit'])->name('wallet.deposit');
    Route::get('/wallet/withdraw', [WalletController::class, 'withdraw'])->name('wallet.withdraw');

    Route::post('/shop/buy', [ShopController::class, 'buy'])->name('shop.buy');
    Route::post('/campaigns/{slug}/reserve', [CampaignController::class, 'reserve'])->name('campaigns.reserve');
    Route::delete('/campaigns/{slug}/reserve', [CampaignController::class, 'releaseReservation'])->name('campaigns.release');
    Route::post('/lotteries/{lotteryId}/purchase', [TicketController::class, 'purchase'])->name('tickets.purchase');
});

Route::get('/tickets/verify/{code}', [TicketController::class, 'verify'])->name('tickets.verify');
