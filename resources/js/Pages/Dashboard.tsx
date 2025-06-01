import React, { useState, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { Home, Bell, User, LogOut, TrendingUp, Calendar, MessageSquare, Hash, Star, Users, Activity, Plus, Search, Filter, Bookmark } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    profile_picture?: string | null;
    username?: string | null;
    bio?: string | null;
    location?: string | null;
}

interface Follower {
    id: number;
    name: string;
    username?: string | null;
    profile_picture?: string | null;
    followers_count?: number;
    is_following?: boolean;
}

interface Comment {
    id: number;
    content: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
}

interface Post {
    id: number;
    content: string;
    image: string | null;
    created_at: string;
    user: User;
    likes_count: number;
    is_liked: boolean;
    comments: Comment[];
}

interface Stats {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    activeUsers: number;
}

interface InertiaPageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
}

interface PageProps extends InertiaPageProps {
    stats: Stats;
    posts: Post[];
    followers: Follower[];
    suggestedUsers: Follower[];
    following: Follower[];
    followingCount: number;
    followersCount: number;
    [key: string]: unknown;
}



// Declare route function
declare function route(name: string): string;

const Dashboard: React.FC = () => {
    const page = usePage<PageProps>();
    const { stats, posts: initialPosts, followers, suggestedUsers, following, followingCount, followersCount } = page.props;
    const user = page.props.auth.user as User;

    // Create quickStats after getting stats from props
    const quickStats = [
        { label: 'Total Posts', value: stats.totalPosts.toString(), icon: MessageSquare, color: 'text-blue-400' },
        { label: 'Active Users', value: stats.activeUsers.toString(), icon: Users, color: 'text-green-400' },
        { label: 'Total Likes', value: stats.totalLikes.toString(), icon: Activity, color: 'text-purple-400' },
        { label: 'Total Comments', value: stats.totalComments.toString(), icon: TrendingUp, color: 'text-red-400' }
    ];

    const [posts, setPosts] = useState<Post[]>(initialPosts || []);
    const [commentData, setCommentData] = useState<{ [key: number]: string }>({});
    const [followersData, setFollowersData] = useState<Follower[]>(followers || []);
    const [suggestedUsersData, setSuggestedUsersData] = useState<Follower[]>(suggestedUsers || []);
    const [followingData, setFollowingData] = useState<Follower[]>(following || []);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'feed' >('feed');
    const [showQuickPost, setShowQuickPost] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const { data, setData, post, processing, reset, errors } = useForm({
        content: '',
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/posts', {
            onSuccess: () => {
                reset();
                setShowQuickPost(false);
                router.reload({
                    only: ['posts'],
                    onSuccess: (page) => {
                        const newPosts = (page.props.posts as Post[]);
                        setPosts(newPosts);
                    },
                });
            },
        });
    };

    const handleLogout = () => {
        if (confirm('Yakin ingin keluar?')) {
            router.post('/logout');
        }
    };

    const handleLike = async (postId: number) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId
                    ? {
                        ...post,
                        is_liked: !post.is_liked,
                        likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1,
                    }
                    : post
            )
        );

        try {
            router.post(`/posts/${postId}/like`, {}, {
                preserveScroll: true,
                onError: () => {
                    setPosts((prevPosts) =>
                        prevPosts.map((post) =>
                            post.id === postId
                                ? {
                                    ...post,
                                    is_liked: !post.is_liked,
                                    likes_count: post.is_liked ? post.likes_count + 1 : post.likes_count - 1,
                                }
                                : post
                        )
                    );
                },
            });
        } catch (error) {
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                            ...post,
                            is_liked: !post.is_liked,
                            likes_count: post.is_liked ? post.likes_count + 1 : post.likes_count - 1,
                        }
                        : post
                )
            );
        }
    };

    const handleFollow = async (userId: number) => {
        setSuggestedUsersData((prevUsers) =>
            prevUsers.map((user) =>
                user.id === userId
                    ? { ...user, is_following: !user.is_following }
                    : user
            )
        );

        try {
            router.post(`/users/${userId}/follow`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({
                        only: ['followers', 'suggestedUsers', 'following', 'followingCount', 'followersCount'],
                        onSuccess: (page) => {
                            setFollowersData((page.props.followers as Follower[]) || []);
                            setSuggestedUsersData((page.props.suggestedUsers as Follower[]) || []);
                            setFollowingData((page.props.following as Follower[]) || []);
                        },
                    });
                },
                onError: () => {
                    setSuggestedUsersData((prevUsers) =>
                        prevUsers.map((user) =>
                            user.id === userId
                                ? { ...user, is_following: !user.is_following }
                                : user
                        )
                    );
                },
            });
        } catch (error) {
            setSuggestedUsersData((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId
                        ? { ...user, is_following: !user.is_following }
                        : user
                )
            );
        }
    };

    const handleUnfollow = async (userId: number) => {
        setFollowingData((prevUsers) =>
            prevUsers.filter((user) => user.id !== userId)
        );

        try {
            router.post(`/users/${userId}/unfollow`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({
                        only: ['followers', 'suggestedUsers', 'following', 'followingCount', 'followersCount'],
                        onSuccess: (page) => {
                            setFollowersData((page.props.followers as Follower[]) || []);
                            setSuggestedUsersData((page.props.suggestedUsers as Follower[]) || []);
                            setFollowingData((page.props.following as Follower[]) || []);
                        },
                    });
                },
                onError: () => {
                    const userToRestore = (following || []).find(u => u.id === userId);
                    if (userToRestore) {
                        setFollowingData((prevUsers) => [...prevUsers, userToRestore]);
                    }
                },
            });
        } catch (error) {
            const userToRestore = (following || []).find(u => u.id === userId);
            if (userToRestore) {
                setFollowingData((prevUsers) => [...prevUsers, userToRestore]);
            }
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent, postId: number) => {
        e.preventDefault();
        const content = commentData[postId];
        if (!content?.trim()) return;

        const tempId = Date.now();
        const newComment = {
            id: tempId,
            content: content.trim(),
            created_at: '0 seconds ago',
            user: {
                id: user.id,
                name: user.name,
            },
        };

        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId
                    ? { ...post, comments: [...post.comments, newComment] }
                    : post
            )
        );

        setCommentData((prev) => ({ ...prev, [postId]: '' }));

        try {
            const response = await fetch(`/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ content: content.trim() }),
            });

            if (!response.ok) {
                throw new Error('Failed to post comment');
            }

            const result = await response.json();
            
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                            ...post,
                            comments: post.comments.map(comment =>
                                comment.id === tempId ? result : comment
                            )
                        }
                        : post
                )
            );

        } catch (error) {
            console.error('Error posting comment:', error);
            
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? { ...post, comments: post.comments.filter(c => c.id !== tempId) }
                        : post
                )
            );
            
            setCommentData((prev) => ({ ...prev, [postId]: content.trim() }));
            alert('Gagal mengirim komentar. Silakan coba lagi.');
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'like': return '❤️';
            case 'comment': return '💬';
            case 'follow': return '👤';
            case 'share': return '🔄';
            default: return '📝';
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Navigation */}
            <nav className="bg-[#0F0E0E] text-white px-6 py-4 flex justify-between items-center  sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold">NextStep</div>
                    <div className="hidden md:flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari postingan, user..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent outline-none text-sm w-48 text-white placeholder-gray-400"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-6 text-xl">
                    <button title="Home" className="hover:text-gray-300 relative">
                        <Home size={24} />
                    </button>
                    <button title="Notifikasi" className="hover:text-gray-300 relative">
                        <Bell size={24} />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-4 h-4 flex items-center justify-center text-white">3</span>
                    </button>
                    <button title="Profil" className="hover:text-gray-300">
                        <User size={24} />
                    </button>
                    <button title="Keluar" className="hover:text-gray-300" onClick={handleLogout}>
                        <LogOut size={24} />
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-6 px-4 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Left Sidebar - Enhanced */}
                <div className="space-y-4">
                    {/* User Profile Card */}
                    <div className="bg-[#0F0E0E] border border-[#D9D9D9] rounded-xl p-5 text-center flex flex-col items-center">
                        <div className="relative mb-4">
                            <img
                                src={user.profile_picture ? `/storage/${user.profile_picture}` : '/images/userrr.png'}
                                alt="Profile"
                                className="rounded-full w-24 h-24 object-cover border-2 border-white"
                            />
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-black"></div>
                        </div>
                        <h2 className="text-lg font-bold mb-1 text-white">{user.username ?? user.name}</h2>
                        <p className="text-sm text-gray-300 mb-2 whitespace-pre-wrap">{user.bio}</p>
                        <p className="text-sm text-gray-400 mb-4">@{user.email}</p>

                        <div className="flex justify-center gap-8 border-t border-gray-700 pt-4 w-full text-sm text-gray-200">
                            <div className="text-center">
                                <span className="font-bold block text-lg text-white">{followingCount || 0}</span>
                                <span className="text-gray-400">Mengikuti</span>
                            </div>
                            <div className="text-center">
                                <span className="font-bold block text-lg text-white">{followersCount || 0}</span>
                                <span className="text-gray-400">Pengikut</span>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-gray-400 w-full space-y-2">
                            <p className="flex items-center justify-center gap-2">
                                📍 {user.location ?? 'Lokasi belum diset'}
                            </p>
                            <p className="flex items-center justify-center gap-2">
                                📧 {user.email}
                            </p>
                            <p className="flex items-center justify-center gap-2">
                                <Calendar size={14} />
                                {formatTime(currentTime)}
                            </p>
                        </div>

                        <div className="flex gap-2 mt-5 w-full">
                            <a
                                href={route('profile.edit')}
                                className="flex-1 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition text-center"
                            >
                                Edit Profil
                            </a>
                            <button
                                onClick={() => setShowQuickPost(!showQuickPost)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                   <div className="bg-[#0F0E0E] border border-[#D9D9D9] rounded-xl p-4">
                        <h3 className="font-bold mb-3 text-sm text-white">Platform Stats</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {quickStats.map((stat, index) => (
                                <div key={index} className="text-center p-2 bg-gray-800 rounded-lg">
                                    <stat.icon size={16} className={`mx-auto mb-1 ${stat.color}`} />
                                    <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                                    <div className="text-xs text-gray-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>

                {/* Middle Feed - Enhanced */}
                <div className="col-span-2 space-y-4">
                    {/* Tab Navigation */}


                    {/* Quick Post Modal */}
                    {showQuickPost && (
                        <div className="bg-[#0F0E0E] border border-[#D9D9D9] p-4 rounded-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white">Posting Cepat</h3>
                                <button
                                    onClick={() => setShowQuickPost(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                                <textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-600 placeholder-gray-400 resize-none"
                                    placeholder="Apa yang mau kamu posting?"
                                    rows={4}
                                />
                                {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
                                <div className="flex items-center justify-between">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('image', e.target.files?.[0] ?? null)}
                                        className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-white file:text-black hover:file:bg-gray-200"
                                    />
                                    <button
                                        type="submit"
                                        disabled={processing || !data.content.trim()}
                                        className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Regular Post Form */}
                    {!showQuickPost && (
                        <div className="bg-[#0F0E0E] border border-[#D9D9D9] p-4 rounded-xl">
                            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                                <div className="flex items-center gap-3 mb-3">
                                    <img
                                        src={user.profile_picture ? `/storage/${user.profile_picture}` : '/images/userrr.png'}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <textarea
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        className="flex-1 p-3 rounded-xl bg-[#0F0E0E] border border-[#D9D9D9] placeholder-gray-400 resize-none"
                                        placeholder="Apa yang sedang Anda pikirkan?"
                                        rows={3}
                                    />
                                </div>
                                {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('image', e.target.files?.[0] ?? null)}
                                            className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-white file:text-black hover:file:bg-gray-200"
                                        />
                                        <button type="button" className="text-gray-400 hover:text-white">
                                            <Bookmark size={20} />
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing || !data.content.trim()}
                                        className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                    >
                                        {processing ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Content based on active tab */}
                    {activeTab === 'feed' && (
                        <>
                            {posts.length === 0 ? (
                                <div className="bg-[#0F0E0E] border border-[#D9D9D9] p-8 rounded-xl text-center text-gray-400">
                                    <MessageSquare size={48} className="mx-auto mb-4 text-gray-600" />
                                    <p className="text-lg mb-2">Belum ada postingan</p>
                                    <p className="text-sm">Jadilah yang pertama untuk membagikan sesuatu!</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <div key={post.id} className="bg-[#0F0E0E] border border-[#D9D9D9] p-6 rounded-xl hover:border-gray-600 transition">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={post.user.profile_picture ? `/storage/${post.user.profile_picture}` : '/images/userrr.png'}
                                                    alt="Profile"
                                                    className="w-12 h-12 rounded-full object-cover border border-gray-600"
                                                />
                                                <div>
                                                    <p className="font-semibold text-lg text-white">{post.user.name}</p>
                                                    <p className="text-sm text-gray-400">{post.created_at}</p>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:text-white">
                                                <Filter size={20} />
                                            </button>
                                        </div>
                                        
                                        <p className="mb-4 whitespace-pre-wrap text-gray-100 leading-relaxed">{post.content}</p>
                                        
                                        {post.image && (
                                            <img
                                                src={post.image}
                                                alt="Post"
                                                className="w-full max-w-md h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                                                onClick={() => setSelectedImage(post.image)}
                                            />
                                        )}

                                        <div className="flex gap-6 mt-6 pt-4 border-t border-gray-700 text-gray-300">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className={`flex items-center gap-2 hover:opacity-80 transition ${
                                                    post.is_liked ? 'text-red-500' : 'text-gray-300'
                                                }`}
                                            >
                                                <span className="text-xl">{post.is_liked ? '❤️' : '🤍'}</span>
                                                <span className="font-semibold">{post.likes_count}</span>
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">💬</span>
                                                <span className="font-semibold">{post.comments.length}</span>
                                            </div>
                                            <button className="flex items-center gap-2 hover:text-blue-400 transition">
                                                <span className="text-xl">🔄</span>
                                                <span>Share</span>
                                            </button>
                                            <button className="flex items-center gap-2 hover:text-yellow-400 transition ml-auto">
                                                <Bookmark size={20} />
                                            </button>
                                        </div>

                                        <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="mt-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.profile_picture ? `/storage/${user.profile_picture}` : '/images/userrr.png'}
                                                    alt="Profile"
                                                    className="w-8 h-8 rounded-fullobject-cover"
                                                />
                                                <input
                                                    value={commentData[post.id] ?? ''}
                                                    onChange={(e) =>
                                                        setCommentData((prev) => ({ ...prev, [post.id]: e.target.value }))
                                                    }
                                                    className="flex-1 p-3 rounded-full bg-[#1A1A1A] text-white border border-[#D9D9D9] placeholder-gray-400"
                                                    placeholder="Tulis komentar..."
                                                />
                                                <button
                                                    type="submit"
                                                    className="text-white hover:bg-blue-600 px-4 py-3 rounded-full bg-blue-500 transition disabled:opacity-50"
                                                    disabled={!commentData[post.id]?.trim()}
                                                >
                                                    Kirim
                                                </button>
                                            </div>
                                        </form>

                                        {post.comments.length > 0 && (
                                            <div className="mt-6 space-y-3 max-h-60 overflow-auto">
                                                {post.comments.map((comment) => (
                                                    <div
                                                        key={comment.id}
                                                        className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-700"
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                                                                {comment.user.name.charAt(0)}
                                                            </div>
                                                            <span className="font-semibold text-sm">{comment.user.name}</span>
                                                            <span className="text-xs text-gray-400">{comment.created_at}</span>
                                                        </div>
                                                        <p className="whitespace-pre-wrap text-gray-200 text-sm">{comment.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </>
                    )}




                </div>

                {/* Right Sidebar - Enhanced */}
                <div className="col-span-1 space-y-4">
                    {/* Saran Mengikuti Section - Enhanced */}
                    <div className="bg-[#0F0E0E] border border-[#D9D9D9] p-4 rounded-xl shadow">
                        <h2 className="font-bold mb-4 text-lg flex items-center gap-2">
                            <Users size={18} className="text-blue-400" />
                            Saran Mengikuti
                        </h2>
                        
                        {suggestedUsersData.length === 0 ? (
                            <div className="text-center py-8">
                                <Users size={48} className="mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-400 text-sm">
                                    Tidak ada saran pengguna untuk diikuti saat ini.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {suggestedUsersData.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] transition">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="relative">
                                                <img
                                                    src={
                                                        user.profile_picture
                                                            ? `/storage/${user.profile_picture}`
                                                            : '/images/userrr.png'
                                                    }
                                                    alt={`${user.name} Profile`}
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-600"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate text-white">
                                                    {user.username ?? user.name}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {user.followers_count ?? 0} pengikut
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleFollow(user.id)}
                                            className={`px-4 py-2 text-xs rounded-full transition font-semibold ${
                                                user.is_following
                                                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                            }`}
                                        >
                                            {user.is_following ? 'Following' : 'Follow'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {suggestedUsersData.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-600">
                                <button className="text-blue-400 text-sm hover:text-blue-300 transition w-full text-center">
                                    Lihat semua saran →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Yang Anda Ikuti Section - Enhanced */}
                    {followingData.length > 0 && (
                        <div className="bg-[#0F0E0E] border border-[#D9D9D9] p-4 rounded-xl shadow">
                            <h2 className="font-bold mb-4 text-lg flex items-center gap-2">
                                <User size={18} className="text-green-400" />
                                Yang Anda Ikuti
                            </h2>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {followingData.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] transition">
                                        <div className="flex items-center gap-3 flex-1">
                                            <img
                                                src={
                                                    user.profile_picture
                                                        ? `/storage/${user.profile_picture}`
                                                        : '/images/userrr.png'
                                                }
                                                alt={`${user.name} Profile`}
                                                className="w-10 h-10 rounded-full object-cover border border-gray-600"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate text-white">
                                                    {user.username ?? user.name}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {user.followers_count ?? 0} pengikut
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUnfollow(user.id)}
                                            className="px-3 py-1 text-xs rounded-full transition bg-red-500 text-white hover:bg-red-600 font-semibold"
                                        >
                                            Unfollow
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-600">
                                <button className="text-blue-400 text-sm hover:text-blue-300 transition w-full text-center">
                                    Lihat semua yang diikuti →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Pengikut Anda Section - Enhanced */}
                    {followersData.length > 0 && (
                        <div className="bg-[#0F0E0E] border border-[#D9D9D9] p-4 rounded-xl shadow">
                            <h2 className="font-bold mb-4 text-lg flex items-center gap-2">
                                <Star size={18} className="text-yellow-400" />
                                Pengikut Terbaru
                            </h2>
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                                {followersData.slice(0, 4).map((follower) => (
                                    <div key={follower.id} className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] transition">
                                        <img
                                            src={
                                                follower.profile_picture
                                                    ? `/storage/${follower.profile_picture}`
                                                    : '/images/userrr.png'
                                            }
                                            alt={`${follower.name} Profile`}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-600"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate text-white">
                                                {follower.username ?? follower.name}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">
                                                Baru mengikuti Anda
                                            </p>
                                        </div>
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-600">
                                <button className="text-blue-400 text-sm hover:text-blue-300 transition w-full text-center">
                                    Lihat semua pengikut →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* About NextStep Section - Enhanced */}
                    <div className="bg-gradient-to-br from-[#0F0E0E] to-[#1A1A1A] border border-[#D9D9D9] p-6 rounded-xl shadow text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">NS</span>
                        </div>
                        <h2 className="font-bold mb-3 text-lg">About NextStep</h2>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                            Platform sosial untuk berbagi cerita, inspirasi, dan membangun komunitas yang positif.
                        </p>
                        <div className="flex justify-center gap-4 text-xs text-gray-400">
                            <span>Privacy</span>
                            <span>•</span>
                            <span>Terms</span>
                            <span>•</span>
                            <span>Help</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Preview Gambar - Enhanced */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold z-10"
                        >
                            ✕
                        </button>
                        <img
                            src={selectedImage}
                            alt="Preview"
                            className="max-w-full max-h-full rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;