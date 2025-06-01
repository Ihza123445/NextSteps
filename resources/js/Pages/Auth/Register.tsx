import { useEffect, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register() {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const { data, setData, post, processing, errors, reset } = form;


    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen bg-[#0F0E0E] flex items-center justify-center">
            <Head title="Register" />

            <div className="w-full max-w-md bg-[#0F0E0E] text-white rounded-lg border border-[#D9D9D9] p-8">
                <h2 className="text-2xl font-bold mb-2">Buat akun baru</h2>
                <p className="text-sm text-gray-400 mb-6">Daftar untuk bergabung dengan komunitas kami</p>

                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block text-sm mb-2 text-white">Nama</label>
                        <input
                            id="name"
                            name="name"
                            value={data.name}
                            className="w-full px-3 py-3 bg-[#1E1E1E] border border-[#D9D9D9] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoComplete="name"
                            placeholder="Masukkan nama anda"
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm mb-2 text-white">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full px-3 py-3 bg-[#1E1E1E] border border-[#D9D9D9] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoComplete="username"
                            placeholder="Email@gmail.com"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm mb-2 text-white">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="w-full px-3 py-3 bg-[#1E1E1E] border border-[#D9D9D9] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    {/* ✅ Tambahkan field konfirmasi password */}
                    <div className="mb-6">
                        <label className="block text-sm mb-2 text-white">Konfirmasi Password</label>
                        <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="w-full px-3 py-3 bg-[#1E1E1E] border border-[#D9D9D9] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-white text-[#0F0E0E] py-3 rounded-md font-medium hover:bg-gray-100 transition duration-200"
                    >
                        Daftar
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <span className="text-gray-400">Sudah punya akun? </span>
                    <Link
                        href={route('login')}
                        className="text-white hover:underline"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
