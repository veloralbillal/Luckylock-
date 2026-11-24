<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'purchase_id',
        'lottery_id',
        'user_id',
        'ticket_number',
        'slot_number',
        'entry_fee',
        'status',
        'prize_amount',
        'prize_rank',
        'purchased_at',
    ];

    protected function casts(): array
    {
        return [
            'entry_fee' => 'decimal:2',
            'prize_amount' => 'decimal:2',
            'purchased_at' => 'datetime',
        ];
    }

    public function lottery(): BelongsTo
    {
        return $this->belongsTo(Lottery::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
