<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'email',
        'password',
        'username',
        'bio',
        'location',
        'profile_picture',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ✅ RELASI YANG DIPERLUKAN
    
    // Users yang diikuti oleh user ini
    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
                    ->withTimestamps();
    }

    // Users yang mengikuti user ini  
    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
                    ->withTimestamps();
    }

    // Posts milik user
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    // Likes yang diberikan user
    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    // Comments yang dibuat user
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    // ✅ METHODS YANG DIPERLUKAN

    /**
     * Cek apakah user ini mengikuti user tertentu
     */
    public function isFollowing(User $user)
    {
        return $this->following()->where('following_id', $user->id)->exists();
    }

    /**
     * Cek apakah user ini diikuti oleh user tertentu  
     */
    public function isFollowedBy(User $user)
    {
        return $this->followers()->where('follower_id', $user->id)->exists();
    }

    /**
     * Follow user tertentu
     */
    public function follow(User $user)
    {
        if (!$this->isFollowing($user) && $this->id !== $user->id) {
            $this->following()->attach($user->id);
        }
    }

    /**
     * Unfollow user tertentu
     */
    public function unfollow(User $user)
    {
        $this->following()->detach($user->id);
    }

    /**
     * Toggle follow/unfollow
     */
    public function toggleFollow(User $user)
    {
        if ($this->isFollowing($user)) {
            $this->unfollow($user);
            return false; // unfollowed
        } else {
            $this->follow($user);
            return true; // followed
        }
    }
}