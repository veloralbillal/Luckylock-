<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Lottery extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'slug',
        'details',
        'category',
        'entry_fee',
        'prize_amount',
        'total_tickets',
        'sold_tickets',
        'draw_mode',
        'status',
        'start_at',
        'end_at',
        'drawn_at',
        'results_published',
        'auto_refund_incomplete',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'entry_fee' => 'decimal:2',
            'prize_amount' => 'decimal:2',
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'drawn_at' => 'datetime',
            'results_published' => 'boolean',
            'auto_refund_incomplete' => 'boolean',
        ];
    }

    public function prizes(): HasMany
    {
        return $this->hasMany(Prize::class)->orderBy('rank_position');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function result(): HasOne
    {
        return $this->hasOne(LotteryResult::class);
    }
}
