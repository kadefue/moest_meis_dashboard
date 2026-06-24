<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;

Route::middleware('api')->group(function () {
    Route::get('/frameworks', [DashboardController::class, 'frameworks']);
    Route::get('/summary', [DashboardController::class, 'summary']);
});

// Drop into: routes/api.php
