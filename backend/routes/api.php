<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\ScheduleController;

Route::prefix('auth')->group(function () {
    // Rate limiting básico: 20 tentativas por minuto
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:20,1');
    Route::post('login',    [AuthController::class, 'login'])->middleware('throttle:20,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me',     [AuthController::class, 'me']);
        Route::post('logout',[AuthController::class, 'logout']);
        Route::put('update-address',[AuthController::class, 'updateAddress']);
    });
});

Route::get('materials', [MaterialController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    // general / collector
    Route::get('schedules', [ScheduleController::class, 'index']); // ?status=pending|accepted|...

    // donor
    Route::post('schedules',      [ScheduleController::class, 'store']);
    Route::get('schedules/me',    [ScheduleController::class, 'mySchedules']);

    // collector
    Route::get('schedules/my-collections',      [ScheduleController::class, 'myCollections']);
    Route::post('schedules/{schedule}/accept',  [ScheduleController::class, 'accept']);
    Route::put('schedules/{schedule}/on-route', [ScheduleController::class, 'markOnRoute']);
    Route::put('schedules/{schedule}/arrived',  [ScheduleController::class, 'markArrived']);
    Route::post('schedules/{schedule}/location', [ScheduleController::class, 'updateLocation']);
    Route::get('schedules/{schedule}/track', [ScheduleController::class, 'track']);
    Route::put('schedules/{schedule}/confirm-collection', [ScheduleController::class, 'confirmCollection']);

    // status updates
    Route::post('schedules/{schedule}/status',  [ScheduleController::class, 'updateStatus']);
});
