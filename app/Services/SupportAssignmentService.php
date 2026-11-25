<?php

namespace App\Services;

use App\Events\Support\SupportChatAssigned;
use App\Events\Support\SupportChatTransferred;
use App\Models\Support\SupportAssignment;
use App\Models\Support\SupportChat;
use App\Models\Support\SupportMessage;
use App\Models\Support\SupportRepresentative;
use App\Models\Support\SupportSetting;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Atomic Live Customer Support Assignment Engine.
 * Enforces strict single-chat capacity (max 1 active chat per representative)
 * using row-level database locks (SELECT ... FOR UPDATE) inside transactions.
 */
class SupportAssignmentService
{
    public function autoAssignChat(SupportChat $chat): ?SupportAssignment
    {
        $settings = SupportSetting::current();
        if (!$settings->auto_assign_enabled) {
            return null;
        }

        return DB::transaction(function () use ($chat) {
            $lockedChat = SupportChat::whereKey($chat->id)->lockForUpdate()->firstOrFail();
            if ($lockedChat->status !== 'waiting' || $lockedChat->representative_id !== null) {
                return null;
            }

            // Find oldest-idle active + online representative with ZERO active chats (locked atomically)
            $eligible = SupportRepresentative::query()
                ->where('account_status', 'active')
                ->where('status', 'online')
                ->whereDoesntHave('activeChats')
                ->orderByRaw('CASE WHEN department_id = ? THEN 0 ELSE 1 END', [$lockedChat->department_id])
                ->orderByRaw('COALESCE(last_assigned_at, "1970-01-01 00:00:00") ASC')
                ->lockForUpdate()
                ->first();

            if (!$eligible) {
                return null;
            }

            return $this->performLockedAssignment($lockedChat, $eligible, 'auto', null, 'Auto-assigned on chat start');
        });
    }

    public function assignNextWaitingCustomerToRep(SupportRepresentative $rep): ?SupportAssignment
    {
        $settings = SupportSetting::current();
        if (!$settings->auto_assign_enabled) {
            return null;
        }

        return DB::transaction(function () use ($rep) {
            $lockedRep = SupportRepresentative::whereKey($rep->id)->lockForUpdate()->firstOrFail();
            if ($lockedRep->account_status !== 'active' || $lockedRep->status !== 'online') {
                return null;
            }

            $activeCount = SupportChat::where('representative_id', $lockedRep->id)
                ->where('status', 'active')
                ->lockForUpdate()
                ->count();
            if ($activeCount > 0) {
                return null;
            }

            $nextWaiting = SupportChat::where('status', 'waiting')
                ->whereNull('representative_id')
                ->orderBy('queue_entered_at', 'asc')
                ->orderBy('id', 'asc')
                ->lockForUpdate()
                ->first();

            if (!$nextWaiting) {
                return null;
            }

            return $this->performLockedAssignment(
                $nextWaiting,
                $lockedRep,
                'auto',
                null,
                'Auto-assigned from FIFO waiting queue'
            );
        });
    }

    public function assignOrTransferManually(
        SupportChat $chat,
        SupportRepresentative $targetRep,
        string $assignedByType,
        ?int $assignedById,
        ?string $reason = null
    ): SupportAssignment {
        return DB::transaction(function () use ($chat, $targetRep, $assignedByType, $assignedById, $reason) {
            $lockedChat = SupportChat::whereKey($chat->id)->lockForUpdate()->firstOrFail();
            if ($lockedChat->status === 'closed') {
                throw new RuntimeException('Cannot assign a closed conversation.');
            }

            $lockedTarget = SupportRepresentative::whereKey($targetRep->id)->lockForUpdate()->firstOrFail();
            if ($lockedTarget->account_status !== 'active') {
                throw new RuntimeException('Target representative is suspended.');
            }
            if ($lockedTarget->status === 'offline') {
                throw new RuntimeException('Target representative is offline.');
            }

            $activeCount = SupportChat::where('representative_id', $lockedTarget->id)
                ->where('status', 'active')
                ->where('id', '!=', $lockedChat->id)
                ->lockForUpdate()
                ->count();
            if ($activeCount >= 1) {
                throw new RuntimeException('Target representative already has an active conversation (max 1 allowed).');
            }

            return $this->performLockedAssignment($lockedChat, $lockedTarget, $assignedByType, $assignedById, $reason);
        });
    }

    protected function performLockedAssignment(
        SupportChat $lockedChat,
        SupportRepresentative $lockedTarget,
        string $assignedByType,
        ?int $assignedById,
        ?string $reason
    ): SupportAssignment {
        $now = now();
        $previousRepId = $lockedChat->representative_id;

        if ($previousRepId && $previousRepId !== $lockedTarget->id) {
            SupportAssignment::where('chat_id', $lockedChat->id)
                ->where('representative_id', $previousRepId)
                ->whereNull('unassigned_at')
                ->update(['unassigned_at' => $now]);

            $prevRep = SupportRepresentative::whereKey($previousRepId)->lockForUpdate()->first();
            if ($prevRep && $prevRep->status === 'busy') {
                $remaining = SupportChat::where('representative_id', $prevRep->id)
                    ->where('status', 'active')
                    ->where('id', '!=', $lockedChat->id)
                    ->count();
                if ($remaining === 0 && $prevRep->account_status === 'active') {
                    $prevRep->update(['status' => 'online']);
                }
            }
        }

        $lockedChat->update([
            'representative_id' => $lockedTarget->id,
            'status' => 'active',
            'assigned_at' => $now,
        ]);

        $lockedTarget->update([
            'status' => 'busy',
            'last_assigned_at' => $now,
        ]);

        $assignment = SupportAssignment::create([
            'chat_id' => $lockedChat->id,
            'representative_id' => $lockedTarget->id,
            'previous_representative_id' => $previousRepId,
            'assigned_by_type' => $assignedByType,
            'assigned_by_id' => $assignedById,
            'reason' => $reason,
            'assigned_at' => $now,
        ]);

        $sysBody = $assignedByType === 'transfer'
            ? "Conversation transferred to {$lockedTarget->name}."
            : "{$lockedTarget->name} joined the conversation.";

        SupportMessage::create([
            'chat_id' => $lockedChat->id,
            'sender_type' => 'system',
            'sender_name' => 'System',
            'body' => $sysBody,
            'delivered_at' => $now,
            'read_at' => $now,
        ]);

        DB::afterCommit(function () use ($lockedChat, $assignment, $assignedByType, $previousRepId) {
            if ($assignedByType === 'transfer' && $previousRepId) {
                broadcast(new SupportChatTransferred($lockedChat->fresh(['representative', 'department']), $assignment));
            } else {
                broadcast(new SupportChatAssigned($lockedChat->fresh(['representative', 'department']), $assignment));
            }
        });

        return $assignment;
    }
}
