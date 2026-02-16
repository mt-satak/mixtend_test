<?php

use App\Http\Controllers\ScheduleController;
use Illuminate\Support\Facades\Route;

Route::get('/schedules', [ScheduleController::class, 'index']);
