<?php

use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\MockScheduleController;
use Illuminate\Support\Facades\Route;

Route::get('/schedules', [ScheduleController::class, 'index']);
Route::get('/mock/schedules', [MockScheduleController::class, 'index']);
