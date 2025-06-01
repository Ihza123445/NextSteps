<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function follow(User $user)
    {
        $currentUser = auth()->user();
        
        if ($currentUser->id === $user->id) {
            return back()->with('error', 'Tidak bisa follow diri sendiri');
        }

        // ✅ PERBAIKAN: Toggle logic - jika sudah follow maka unfollow, jika belum follow maka follow
        if ($currentUser->isFollowing($user)) {
            $currentUser->following()->detach($user->id);
            $message = 'Berhasil unfollow ' . ($user->username ?? $user->name);
        } else {
            $currentUser->following()->attach($user->id);
            $message = 'Berhasil follow ' . ($user->username ?? $user->name);
        }

        return back()->with('success', $message);
    }

    public function unfollow(User $user)
    {
        auth()->user()->following()->detach($user->id);
        return back()->with('success', 'Berhasil unfollow');
    }
}