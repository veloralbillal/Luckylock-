<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Winner extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'lottery_id',
        'result_id',
        'ticket_id',
        'user_id',
        'prize_id',
        'rank_position',
        'prize_title',
        'prize_amount',
        'ticket_number',
        'awarded_at',
    ];

    protected function casts(): array
    {
        return [
            'prize_amount' => 'decimal:2',
            'awarded_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lottery(): BelongsTo
    {
        return $this->belongsTo(Lottery::class);
    }
}
