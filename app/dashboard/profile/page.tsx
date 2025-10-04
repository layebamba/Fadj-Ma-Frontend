'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone?: string;
    role: string;
    role_display: string;
    avatar?: string;
}

export default function ProfilePage() {
    const { user: authUser, updateUser } = useAuth();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/auth/profile/');
            const userData = response.data;

            setUser(userData);
            setFormData({
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                phone: userData.phone || '',
            });
            setAvatarPreview(userData.avatar || '');
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await api.put('/auth/profile/', formData);
            setUser(response.data);

            // Mettre à jour le contexte d'authentification
            if (updateUser) {
                updateUser(response.data);
            }

            alert('Profil mis à jour avec succès');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erreur lors de la mise à jour du profil');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);

            // Prévisualisation
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitAvatar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!avatarFile) return;

        try {
            setSaving(true);
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            const response = await api.put('/auth/profile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUser(response.data);
            setAvatarPreview(response.data.avatar);

            // Mettre à jour le contexte d'authentification
            if (updateUser) {
                updateUser(response.data);
            }

            alert('Photo de profil mise à jour avec succès');
            setAvatarFile(null);
        } catch (error) {
            console.error('Error updating avatar:', error);
            alert('Erreur lors de la mise à jour de la photo');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            setSaving(true);
            await api.post('/auth/change-password/', {
                old_password: passwordData.current_password,
                new_password: passwordData.new_password,
            });

            alert('Mot de passe modifié avec succès');
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
        } catch (error: any) {
            console.error('Error changing password:', error);
            const errorMsg = error.response?.data?.old_password?.[0] ||
                error.response?.data?.new_password?.[0] ||
                'Erreur lors du changement de mot de passe';
            alert(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-lg text-gray-600">Chargement...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout>
                <div className="text-center text-red-600">Erreur de chargement du profil</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
                    <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
                </div>

                {/* Card principale */}
                <div className="bg-white rounded-lg border">
                    {/* Tabs */}
                    <div className="border-b">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'info'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Informations personnelles
                            </button>
                            <button
                                onClick={() => setActiveTab('photo')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'photo'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Photo de profil
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'password'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Sécurité
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Tab: Informations personnelles */}
                        {activeTab === 'info' && (
                            <form onSubmit={handleSubmitInfo} className="space-y-6 max-w-2xl">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prénom
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom d'utilisateur
                                    </label>
                                    <input
                                        type="text"
                                        value={user.username}
                                        disabled
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Le nom d'utilisateur ne peut pas être modifié</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rôle
                                    </label>
                                    <input
                                        type="text"
                                        value={user.role_display}
                                        disabled
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                    >
                                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Tab: Photo de profil */}
                        {activeTab === 'photo' && (
                            <div className="max-w-2xl space-y-6">
                                <div className="flex items-center space-x-6">
                                    <div className="relative">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar"
                                                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-gray-200">
                                                <span className="text-4xl font-bold text-blue-600">
                                                    {user.full_name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Photo de profil</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Formats acceptés: JPG, PNG, GIF (max 2MB)
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>
                                </div>

                                {avatarFile && (
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAvatarFile(null);
                                                setAvatarPreview(user.avatar || '');
                                            }}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleSubmitAvatar}
                                            disabled={saving}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                        >
                                            {saving ? 'Téléchargement...' : 'Télécharger la photo'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Sécurité */}
                        {activeTab === 'password' && (
                            <form onSubmit={handleSubmitPassword} className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        Assurez-vous d'utiliser un mot de passe fort avec au moins 8 caractères.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mot de passe actuel
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nouveau mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        minLength={8}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmer le nouveau mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.confirm_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        minLength={8}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                    >
                                        {saving ? 'Modification...' : 'Changer le mot de passe'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}