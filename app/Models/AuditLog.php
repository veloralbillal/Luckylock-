<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    public const UPDATED_AT = null;

    protected $fillable = [
        'id',
        'actor_id',
        'actor_username',
        'action',
        'target_type',
        'target_id',
        'details_json',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'details_json' => 'array',
        ];
    }
}
