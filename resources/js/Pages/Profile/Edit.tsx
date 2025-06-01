import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';

interface UserProfile {
    username?: string | null;
    bio?: string | null;
    location?: string | null;
    profile_picture?: string | null;
}

export default function Edit({ user }: { user: UserProfile }) {
    const { data, setData, post, processing, errors } = useForm<{
        username: string;
        bio: string;
        location: string;
        profile_picture: File | null;
    }>({
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        profile_picture: null,
    });

    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (data.profile_picture) {
            const url = URL.createObjectURL(data.profile_picture);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreview(null);
        }
    }, [data.profile_picture]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Buat FormData manual untuk file upload
        const formData = new FormData();
        formData.append('username', data.username);
        formData.append('bio', data.bio);
        formData.append('location', data.location);
        formData.append('_method', 'PATCH'); // Laravel method spoofing

        if (data.profile_picture) {
            formData.append('profile_picture', data.profile_picture);
        }

        router.post(route('profile.update'), formData, {
            onSuccess: () => {
                router.visit('/dashboard', {
                    only: ['auth', 'posts'],
                    preserveScroll: true,
                });
            },
        });
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
            <Head title="Edit Profil" />
            <div className="w-full max-w-md bg-[#0F0E0E] rounded-xl border border-[#D9D9D9] p-6">
                <h1 className="text-2xl font-bold mb-6">Edit Profil</h1>

                <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
                    <div>
                        <label className="block mb-1">Username</label>
                        <input
                            type="text"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            className="w-full p-2 rounded bg-[#1E1E1E] border border-[#D9D9D9]"
                        />
                        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                    </div>

                    <div>
                        <label className="block mb-1">Bio</label>
                        <textarea
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            className="w-full p-2 rounded bg-[#1E1E1E] border border-[#D9D9D9]"
                        />
                        {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
                    </div>

                    <div>
                        <label className="block mb-1">Lokasi</label>
                        <input
                            type="text"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            className="w-full p-2 rounded bg-[#1E1E1E] border border-[#D9D9D9]"
                        />
                        {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                    </div>

                    <div>
                        <label className="block mb-1">Foto Profil</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('profile_picture', e.target.files?.[0] ?? null)}
                            className="text-white"
                        />
                        {errors.profile_picture && (
                            <p className="text-red-500 text-sm">{errors.profile_picture}</p>
                        )}
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="mt-4 rounded-full w-24 h-24 object-cover border border-[#D9D9D9]"
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition"
                    >
                        Simpan
                    </button>
                </form>
            </div>
        </div>
    );
}
