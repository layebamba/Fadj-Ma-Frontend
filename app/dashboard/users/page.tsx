'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    role_display: string;
    is_active: boolean;
    last_login: string;
    date_joined: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/');
            setUsers(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-lg text-gray-600">Chargement...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
                        <p className="text-gray-600 mt-1">Gérez les utilisateurs du système</p>
                    </div>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Total des utilisateurs</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{users.length}</div>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Utilisateurs actifs</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {users.filter(u => u.is_active).length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Nouveaux ce mois</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {users.filter(u => {
                                const date = new Date(u.date_joined);
                                const now = new Date();
                                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                            }).length}
                        </div>
                    </div>
                </div>

                {/* Recherche */}
                <div className="bg-white rounded-lg border p-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Tableau */}
                <div className="bg-white rounded-lg border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nom complet
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rôle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dernière connexion
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                {user.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                                <div className="text-sm text-gray-500">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                                                {user.role_display}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.is_active ? (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                    Actif
                                                </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                                    Inactif
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}