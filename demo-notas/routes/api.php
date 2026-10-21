<?php

use Acme\DemoNotas\Http\NotesController;
use Illuminate\Support\Facades\Route;

Route::get('me', [NotesController::class, 'me']);
Route::get('customers', [NotesController::class, 'customers']);
Route::get('notes', [NotesController::class, 'index']);
Route::post('notes', [NotesController::class, 'store']);
Route::delete('notes/{note}', [NotesController::class, 'destroy']);
