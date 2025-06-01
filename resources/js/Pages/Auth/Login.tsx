import { useEffect, FormEventHandler } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

interface LoginData {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const { data, setData, post, processing, errors, reset } = form as typeof form & {
        data: LoginData;
        setData: (field: keyof LoginData, value: string | boolean) => void;
    };


    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

return (
    <div className="min-h-screen bg-[#0F0E0E] flex items-center justify-center">
        <Head title="Log in" />

        <div className="w-full max-w-md bg-[#0F0E0E] rounded-xl border border-[#D9D9D9] p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Selamat datang kembali!</h2>
            <p className="text-gray-400 mb-6">
                Login untuk mendapatkan profil kamu dan berinteraksi dengan orang lain
            </p>

            {status && <div className="mb-4 font-medium text-sm text-green-500">{status}</div>}

            <form onSubmit={submit}>
                <div className="mb-4">
                    <label className="block text-white text-sm mb-2">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full px-3 py-3 bg-[#0F0E0E] border border-[#D9D9D9] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoComplete="username"
                        placeholder="Email@gmail.com"
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mb-6">
                    <label className="block text-white text-sm mb-2">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full px-3 py-3 bg-[#0F0E0E] border border-[#D9D9D9] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoComplete="current-password"
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-white text-black py-3 rounded-md font-medium hover:bg-gray-200 transition duration-200"
                >
                    Login
                </button>
            </form>

            <div className="mt-6 text-center">
                <span className="text-gray-400">Belum punya akun? </span>
                <Link
                    href={route('register')}
                    className="text-white hover:underline"
                >
                    Daftar
                    </Link>
                </div>
            </div>
        </div>
    );
}