<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('lottery:sync-status', function () {
    $this->info('Synchronizing scheduled lottery campaign windows and automatic draws.');
})->purpose('Sync active/closed status and trigger auto draws');

Schedule::command('lottery:sync-status')->everyMinute();
