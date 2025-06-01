<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use App\Models\Like;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $posts = Post::with(['user', 'likes', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($post) use ($user) {
                return [
                    'id' => $post->id,
                    'content' => $post->content,
                    'image' => $post->image ? Storage::url($post->image) : null,
                    'created_at' => $post->created_at->diffForHumans(),
                    'user' => [
                        'id' => $post->user->id,
                        'name' => $post->user->username ?? $post->user->name,
                        'email' => $post->user->email,
                        'profile_picture' => $post->user->profile_picture,
                    ],
                    'likes_count' => $post->likes->count(),
                    'is_liked' => $post->isLikedBy($user),
                    'comments' => $post->comments->map(function ($comment) {
                        return [
                            'id' => $comment->id,
                            'content' => $comment->content,
                            'created_at' => $comment->created_at->diffForHumans(),
                            'user' => [
                                'id' => $comment->user->id,
                                'name' => $comment->user->name,
                            ],
                        ];
                    }),
                ];
            });

        $followers = $user->followers()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($follower) use ($user) {
                return [
                    'id' => $follower->id,
                    'name' => $follower->name,
                    'username' => $follower->username,
                    'profile_picture' => $follower->profile_picture,
                    'followers_count' => $follower->followers()->count(),
                    'is_following' => $user->isFollowing($follower),
                ];
            });

        $following = $user->following()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($followedUser) use ($user) {
                return [
                    'id' => $followedUser->id,
                    'name' => $followedUser->name,
                    'username' => $followedUser->username,
                    'profile_picture' => $followedUser->profile_picture,
                    'followers_count' => $followedUser->followers()->count(),
                    'is_following' => true,
                ];
            });

        $suggestedUsers = User::where('id', '!=', $user->id)
            ->whereNotIn('id', $user->following()->pluck('users.id'))
            ->whereNotIn('id', $user->followers()->pluck('users.id'))
            ->inRandomOrder()
            ->take(5)
            ->get()
            ->map(function ($otherUser) {
                return [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'username' => $otherUser->username,
                    'profile_picture' => $otherUser->profile_picture,
                    'followers_count' => $otherUser->followers()->count(),
                    'is_following' => false,
                ];
            });

        $followingCount = $user->following()->count();
        $followersCount = $user->followers()->count();

        // Statistik untuk dashboard
        $totalPosts = Post::count();
        $totalLikes = Like::count();
        $totalComments = Comment::count();
        $activeUsers = User::count(); // Ganti jika ada kolom "last_seen"

        return Inertia::render('Dashboard', [
            'posts' => $posts,
            'followers' => $followers,
            'following' => $following,
            'suggestedUsers' => $suggestedUsers,
            'followingCount' => $followingCount,
            'followersCount' => $followersCount,
            'stats' => [
                'totalPosts' => $totalPosts,
                'totalLikes' => $totalLikes,
                'totalComments' => $totalComments,
                'activeUsers' => $activeUsers,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $post = new Post([
            'user_id' => auth()->id(),
            'content' => $request->content,
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('posts', 'public');
            $post->image = $path;
        }

        $post->save();

        return redirect()->back();
    }

    public function destroy(Post $post)
    {
        if ($post->user_id !== auth()->id()) {
            abort(403);
        }

        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();

        return redirect()->back();
    }
}
