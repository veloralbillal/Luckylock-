<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LotteryResult extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'lottery_id',
        'draw_seed_hash',
        'winning_numbers_json',
        'total_tickets_entered',
        'total_payout',
        'is_published',
        'drawn_by',
        'drawn_at',
    ];

    protected function casts(): array
    {
        return [
            'winning_numbers_json' => 'array',
            'total_payout' => 'decimal:2',
            'is_published' => 'boolean',
            'drawn_at' => 'datetime',
        ];
    }

    public function lottery(): BelongsTo
    {
        return $this->belongsTo(Lottery::class);
    }

    public function winners(): HasMany
    {
        return $this->hasMany(Winner::class, 'result_id')->orderBy('rank_position');
    }
}
