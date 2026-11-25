<?php

use App\Models\Support\SupportChat;
use App\Models\Support\SupportRepresentative;
use Illuminate\Support\Facades\Broadcast;

/**
 * Private Live Support Chat Channel
 * Authorized ONLY for:
 * - Chat's customer owner (logged-in user or verified guest token)
 * - Currently assigned (or previously assigned) support representative
 * - Authenticated Admin / Moderator
 */
Broadcast::channel('support.chat.{chatId}', function ($user, int $chatId) {
    $chat = SupportChat::find($chatId);
    if (!$chat) {
        return false;
    }

    if ($user instanceof SupportRepresentative) {
        if ($user->account_status !== 'active') {
            return false;
        }
        return (int) $chat->representative_id === (int) $user->id;
    }

    if (in_array($user->role ?? '', ['admin', 'moderator'], true)) {
        return true;
    }

    return $chat->customer_user_id !== null && (int) $chat->customer_user_id === (int) $user->id;
}, ['guards' => ['sanctum', 'support_rep']]);

/**
 * Private Representative Assignment & Inbox Channel
 */
Broadcast::channel('support.rep.{representativeId}', function ($user, int $representativeId) {
    if ($user instanceof SupportRepresentative) {
        return $user->account_status === 'active' && (int) $user->id === $representativeId;
    }
    return in_array($user->role ?? '', ['admin', 'moderator'], true);
}, ['guards' => ['sanctum', 'support_rep']]);

/**
 * Admin Support Operations Monitoring Channel
 */
Broadcast::channel('support.admin', function ($user) {
    return !($user instanceof SupportRepresentative)
        && in_array($user->role ?? '', ['admin', 'moderator'], true);
}, ['guards' => ['sanctum']]);

/**
 * Representative Presence Channel
 */
Broadcast::channel('support.presence', function ($user) {
    if ($user instanceof SupportRepresentative && $user->account_status === 'active') {
        return ['id' => $user->id, 'name' => $user->name, 'status' => $user->status, 'type' => 'representative'];
    }
    if (!($user instanceof SupportRepresentative) && in_array($user->role ?? '', ['admin', 'moderator'], true)) {
        return ['id' => $user->id, 'name' => $user->name ?? $user->username, 'type' => 'admin'];
    }
    return false;
}, ['guards' => ['sanctum', 'support_rep']]);
