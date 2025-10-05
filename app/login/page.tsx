'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, register, user} = useAuth();
    const router = useRouter();

    // Login form state
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    // Register form state
    const [registerData, setRegisterData] = useState({
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        gender: 'M',
        birth_date: '',
        phone: '',
        role: 'user',
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = await login(loginData.email, loginData.password);
            if (userData.role === 'ADMIN' || userData.role === 'admin') {
                router.push('/dashboard');
            } else {
                router.push('dashboard/medicines');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (registerData.password !== registerData.password2) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);

        try {
            await register(registerData);
        } catch (err: any) {
            setError(err.response?.data?.email?.[0] || err.response?.data?.detail || 'Erreur d\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 text-white py-8">
                <div className="max-w-xl mx-auto px-4 text-center">
                    <h1 className="text-2xl font-semibold mb-2">Bienvenue chez votre pharmacie</h1>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl">🛒</span>
                        <span className="text-2xl font-bold">Fadj-Ma</span>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="flex-1 bg-gray-50 py-12 px-4">
                <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
                    {/* Tabs */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                                isLogin
                                    ? 'bg-blue-200 text-gray-900 border-2 border-blue-400'
                                    : 'bg-white text-gray-700 border-2 border-gray-300'
                            }`}
                        >
                            Connectez-vous
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                                !isLogin
                                    ? 'bg-blue-200 text-gray-900 border-2 border-blue-400'
                                    : 'bg-white text-gray-700 border-2 border-gray-300'
                            }`}
                        >
                            Inscrivez-vous
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    {isLogin ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Adresse e-mail
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Mot de passe
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                />
                            </div>

                            <div className="text-right">
                                <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                                    Mot de passe oublié?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-200 hover:bg-blue-300 text-gray-900 font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Connexion...' : 'Se connecter'}
                            </button>
                        </form>
                    ) : (
                        /* Register Form */
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Vos coordonées
                                </label>
                                <div className="flex gap-4 mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="M"
                                            checked={registerData.gender === 'M'}
                                            onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                                            className="w-5 h-5"
                                        />
                                        <span>Homme</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="F"
                                            checked={registerData.gender === 'F'}
                                            onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                                            className="w-5 h-5"
                                        />
                                        <span>Femme</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">Prénom</label>
                                    <input
                                        type="text"
                                        required
                                        value={registerData.first_name}
                                        onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">Nom</label>
                                    <input
                                        type="text"
                                        required
                                        value={registerData.last_name}
                                        onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Date de naissance
                                </label>
                                <input
                                    type="date"
                                    value={registerData.birth_date}
                                    onChange={(e) => setRegisterData({ ...registerData, birth_date: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">Téléphone</label>
                                <input
                                    type="tel"
                                    placeholder="771234567"
                                    value={registerData.phone}
                                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">E-mail</label>
                                    <input
                                        type="email"
                                        required
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">Mot de passe</label>
                                    <input
                                        type="password"
                                        required
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">Confirmer</label>
                                <input
                                    type="password"
                                    required
                                    value={registerData.password2}
                                    onChange={(e) => setRegisterData({ ...registerData, password2: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-200 hover:bg-blue-300 text-gray-900 font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Inscription...' : "S'inscrire"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}