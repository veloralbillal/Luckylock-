<?php

use App\Http\Controllers\Admin\AdminLotteryController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RewardsController;
use App\Http\Controllers\Support\AdminSupportController;
use App\Http\Controllers\Support\CustomerSupportController;
use App\Http\Controllers\Support\RepresentativeSupportController;
use App\Http\Controllers\TicketController;
use Illuminate\Support\Facades\Route;

Route::get('/tickets/verify/{code}', [TicketController::class, 'verify']);

// Live Customer Support — Customer & Representative Separate Auth Routes
Route::prefix('support')->group(function () {
    Route::post('/chats', [CustomerSupportController::class, 'startChat'])->middleware('throttle:15,1');
    Route::post('/chats/{chat}/messages', [CustomerSupportController::class, 'sendMessage'])->middleware('throttle:45,1');
    Route::post('/chats/{chat}/close', [CustomerSupportController::class, 'closeChat']);
    Route::post('/chats/{chat}/rating', [CustomerSupportController::class, 'submitRating']);

    Route::post('/rep/login', [RepresentativeSupportController::class, 'login'])->middleware('throttle:12,1');
    Route::middleware('auth:support_rep')->prefix('rep')->group(function () {
        Route::post('/status', [RepresentativeSupportController::class, 'updateStatus']);
        Route::post('/chats/{chat}/transfer', [RepresentativeSupportController::class, 'transferChat']);
        Route::post('/chats/{chat}/read', [RepresentativeSupportController::class, 'markRead']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/campaigns/{slug}/reserve', [CampaignController::class, 'reserve']);
    Route::delete('/campaigns/{slug}/reserve', [CampaignController::class, 'releaseReservation']);
    Route::post('/lotteries/{lotteryId}/purchase', [TicketController::class, 'purchase']);
    Route::post('/payments/deposit', [PaymentController::class, 'submitDeposit']);
    Route::post('/withdrawals', [PaymentController::class, 'requestWithdrawal']);
    Route::post('/rewards/wheel/spin', [RewardsController::class, 'spinWheel']);
    Route::post('/rewards/tasks/{taskId}/claim', [RewardsController::class, 'claimDailyTask']);

    Route::get('/chat/messages', [ChatController::class, 'index']);
    Route::post('/chat/messages', [ChatController::class, 'store']);
    Route::delete('/chat/messages/{id}', [ChatController::class, 'destroy']);

    Route::middleware('admin.role:staff')->prefix('admin')->group(function () {
        Route::post('/lotteries', [AdminLotteryController::class, 'storeCampaign']);
        Route::post('/lotteries/{lotteryId}/draw', [AdminLotteryController::class, 'triggerDraw']);
        Route::post('/payments/{paymentId}/verify', [AdminLotteryController::class, 'verifyPayment']);
        Route::post('/banners', [AdminLotteryController::class, 'storeBanner']);

        Route::post('/support/representatives', [AdminSupportController::class, 'createRepresentative']);
        Route::post('/support/chats/{chat}/assign', [AdminSupportController::class, 'manualAssign']);
    });
});
