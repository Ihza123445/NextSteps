<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FollowController; // Tambahkan ini
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/login');
});

Route::middleware('auth')->group(function () {
    // Dashboard
    Route::get('/dashboard', [PostController::class, 'index'])->name('dashboard');

    // Post
    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');

    // Like
    Route::post('/posts/{post}/like', [LikeController::class, 'toggle'])->name('posts.like');

    // Comment
    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->name('comments.store');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Tambahkan route follow/unfollow di sini
    Route::post('/users/{user}/follow', [FollowController::class, 'follow'])->name('follow');
    Route::post('/users/{user}/unfollow', [FollowController::class, 'unfollow'])->name('unfollow');
});

require __DIR__.'/auth.php';