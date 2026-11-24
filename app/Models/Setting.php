<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $primaryKey = 'setting_key';
    public $incrementing = false;
    protected $keyType = 'string';
    public const CREATED_AT = null;

    protected $fillable = [
        'setting_key',
        'setting_value',
    ];
}
