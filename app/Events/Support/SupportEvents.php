<?php

namespace App\Events\Support;

use App\Models\Support\SupportAssignment;
use App\Models\Support\SupportChat;
use App\Models\Support\SupportMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SupportMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public SupportMessage $message) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("support.chat.{$this->message->chat_id}"),
            new PrivateChannel('support.admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'support.message.sent';
    }
}

class SupportChatAssigned implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public SupportChat $chat,
        public SupportAssignment $assignment
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("support.chat.{$this->chat->id}"),
            new PrivateChannel("support.rep.{$this->assignment->representative_id}"),
            new PrivateChannel('support.admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'support.chat.assigned';
    }
}

class SupportChatTransferred implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public SupportChat $chat,
        public SupportAssignment $assignment
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel("support.chat.{$this->chat->id}"),
            new PrivateChannel("support.rep.{$this->assignment->representative_id}"),
            new PrivateChannel('support.admin'),
        ];
        if ($this->assignment->previous_representative_id) {
            $channels[] = new PrivateChannel("support.rep.{$this->assignment->previous_representative_id}");
        }
        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'support.chat.transferred';
    }
}

class SupportTypingUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $chatId,
        public string $senderType,
        public string $senderName,
        public bool $isTyping
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("support.chat.{$this->chatId}")];
    }

    public function broadcastAs(): string
    {
        return 'support.typing';
    }
}

class SupportMessagesRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $chatId,
        public string $readerType,
        public array $messageIds,
        public string $readAt
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("support.chat.{$this->chatId}")];
    }

    public function broadcastAs(): string
    {
        return 'support.messages.read';
    }
}

class SupportChatClosed implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public SupportChat $chat,
        public string $closedByType
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel("support.chat.{$this->chat->id}"),
            new PrivateChannel('support.admin'),
        ];
        if ($this->chat->representative_id) {
            $channels[] = new PrivateChannel("support.rep.{$this->chat->representative_id}");
        }
        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'support.chat.closed';
    }
}

class SupportPresenceUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $representativeId,
        public string $status,
        public bool $isConnected
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('support.admin'),
            new PrivateChannel("support.rep.{$this->representativeId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'support.presence.updated';
    }
}
