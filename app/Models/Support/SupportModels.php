<?php

namespace App\Models\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class SupportDepartment extends Model
{
    protected $table = 'support_departments';
    protected $fillable = ['name', 'slug', 'description', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public function representatives(): HasMany
    {
        return $this->hasMany(SupportRepresentative::class, 'department_id');
    }

    public function chats(): HasMany
    {
        return $this->hasMany(SupportChat::class, 'department_id');
    }
}

class SupportRepresentative extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'support_representatives';
    protected $fillable = [
        'name', 'username', 'email', 'phone', 'password', 'avatar_url',
        'department_id', 'status', 'account_status', 'max_active_chats',
        'last_assigned_at', 'last_seen_at',
    ];
    protected $hidden = ['password', 'remember_token'];
    protected $casts = [
        'last_assigned_at' => 'datetime',
        'last_seen_at' => 'datetime',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(SupportDepartment::class, 'department_id');
    }

    public function chats(): HasMany
    {
        return $this->hasMany(SupportChat::class, 'representative_id');
    }

    public function activeChats(): HasMany
    {
        return $this->hasMany(SupportChat::class, 'representative_id')->where('status', 'active');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(SupportAssignment::class, 'representative_id');
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(SupportRating::class, 'representative_id');
    }

    public function presence(): HasOne
    {
        return $this->hasOne(SupportPresence::class, 'representative_id');
    }
}

class SupportChat extends Model
{
    protected $table = 'support_chats';
    protected $fillable = [
        'ticket_code', 'customer_user_id', 'customer_name', 'customer_phone', 'customer_email',
        'guest_token_hash', 'department_id', 'representative_id', 'status', 'queue_entered_at',
        'assigned_at', 'closed_at', 'closed_by_type', 'closed_by_id', 'last_message_preview',
        'last_message_at', 'customer_unread_count', 'rep_unread_count',
    ];
    protected $casts = [
        'queue_entered_at' => 'datetime',
        'assigned_at' => 'datetime',
        'closed_at' => 'datetime',
        'last_message_at' => 'datetime',
    ];

    public function customerUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_user_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(SupportDepartment::class, 'department_id');
    }

    public function representative(): BelongsTo
    {
        return $this->belongsTo(SupportRepresentative::class, 'representative_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(SupportMessage::class, 'chat_id')->orderBy('created_at');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(SupportAttachment::class, 'chat_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(SupportAssignment::class, 'chat_id')->orderByDesc('assigned_at');
    }

    public function rating(): HasOne
    {
        return $this->hasOne(SupportRating::class, 'chat_id');
    }
}

class SupportMessage extends Model
{
    protected $table = 'support_messages';
    protected $fillable = [
        'chat_id', 'sender_type', 'sender_id', 'sender_name', 'body', 'delivered_at', 'read_at',
    ];
    protected $casts = [
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    public function chat(): BelongsTo
    {
        return $this->belongsTo(SupportChat::class, 'chat_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(SupportAttachment::class, 'message_id');
    }
}

class SupportAttachment extends Model
{
    protected $table = 'support_attachments';
    protected $fillable = [
        'chat_id', 'message_id', 'uploaded_by_type', 'uploaded_by_id',
        'original_name', 'storage_disk', 'storage_path', 'mime_type', 'extension', 'size_bytes',
    ];

    public function chat(): BelongsTo
    {
        return $this->belongsTo(SupportChat::class, 'chat_id');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(SupportMessage::class, 'message_id');
    }
}

class SupportAssignment extends Model
{
    protected $table = 'support_assignments';
    protected $fillable = [
        'chat_id', 'representative_id', 'previous_representative_id',
        'assigned_by_type', 'assigned_by_id', 'reason', 'assigned_at', 'unassigned_at',
    ];
    protected $casts = [
        'assigned_at' => 'datetime',
        'unassigned_at' => 'datetime',
    ];

    public function chat(): BelongsTo
    {
        return $this->belongsTo(SupportChat::class, 'chat_id');
    }

    public function representative(): BelongsTo
    {
        return $this->belongsTo(SupportRepresentative::class, 'representative_id');
    }
}

class SupportRating extends Model
{
    protected $table = 'support_ratings';
    protected $fillable = [
        'chat_id', 'representative_id', 'customer_name', 'customer_phone', 'rating', 'feedback',
    ];

    public function chat(): BelongsTo
    {
        return $this->belongsTo(SupportChat::class, 'chat_id');
    }

    public function representative(): BelongsTo
    {
        return $this->belongsTo(SupportRepresentative::class, 'representative_id');
    }
}

class SupportSetting extends Model
{
    protected $table = 'support_settings';
    protected $fillable = [
        'auto_assign_enabled', 'max_active_chats_per_rep', 'max_upload_mb',
        'allowed_extensions', 'allowed_mime_types', 'welcome_message', 'queue_message', 'offline_message',
    ];
    protected $casts = [
        'auto_assign_enabled' => 'boolean',
        'allowed_extensions' => 'array',
        'allowed_mime_types' => 'array',
    ];

    public static function current(): self
    {
        return static::firstOrCreate([], [
            'auto_assign_enabled' => true,
            'max_active_chats_per_rep' => 1,
            'max_upload_mb' => 5,
            'allowed_extensions' => ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'txt', 'csv'],
            'allowed_mime_types' => ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'text/csv'],
            'welcome_message' => 'Welcome to Live Support! A dedicated representative will assist you shortly.',
            'queue_message' => 'All representatives are currently assisting other customers. You are in the priority queue.',
            'offline_message' => 'Our representatives are currently offline. Leave your message and we will connect automatically.',
        ]);
    }
}

class SupportPresence extends Model
{
    protected $table = 'support_presence';
    protected $fillable = [
        'representative_id', 'is_connected', 'socket_count', 'last_heartbeat_at', 'disconnected_at',
    ];
    protected $casts = [
        'is_connected' => 'boolean',
        'last_heartbeat_at' => 'datetime',
        'disconnected_at' => 'datetime',
    ];

    public function representative(): BelongsTo
    {
        return $this->belongsTo(SupportRepresentative::class, 'representative_id');
    }
}
