<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Inertia::share('auth.user', function () {
            return auth()->check()
                ? auth()->user()->refresh()->only([
                    'id',
                    'name',
                    'email',
                    'profile_picture',
                    'username',
                    'bio',
                    'location'
                ])
                : null;
        });
    }
}
