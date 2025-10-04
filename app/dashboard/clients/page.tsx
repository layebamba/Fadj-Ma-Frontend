'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

interface Client {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    gender: string;
    birth_date: string;
    phone: string;
    email: string;
    address: string;
    purchases_count: number;
    created_at: string;
    updated_at: string;
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        gender: '',
        birth_date: '',
        phone: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/clients/');
            setClients(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingClient) {
                await api.put(`/clients/${editingClient.id}/`, formData);
            } else {
                await api.post('/clients/', formData);
            }
            fetchClients();
            closeModal();
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

        try {
            await api.delete(`/clients/${id}/`);
            fetchClients();
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const openModal = (client?: Client) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                first_name: client.first_name,
                last_name: client.last_name,
                gender: client.gender,
                birth_date: client.birth_date,
                phone: client.phone,
                email: client.email,
                address: client.address
            });
        } else {
            setEditingClient(null);
            setFormData({
                first_name: '',
                last_name: '',
                gender: '',
                birth_date: '',
                phone: '',
                email: '',
                address: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingClient(null);
        setFormData({
            first_name: '',
            last_name: '',
            gender: '',
            birth_date: '',
            phone: '',
            email: '',
            address: ''
        });
    };

    const filteredClients = clients.filter(client =>
        client.full_name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.phone.includes(search)
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
                        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
                        <p className="text-gray-600 mt-1">Gérez votre base de clients</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        + Nouveau client
                    </button>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Total des clients</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{clients.length}</div>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Achats totaux</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {clients.reduce((sum, c) => sum + c.purchases_count, 0)}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Clients actifs</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {clients.filter(c => c.purchases_count > 0).length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Nouveaux ce mois</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {clients.filter(c => {
                                const date = new Date(c.created_at);
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
                            placeholder="Rechercher par nom, email ou téléphone..."
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
                                Genre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date de naissance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Achats
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClients.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Aucun client trouvé
                                </td>
                            </tr>
                        ) : (
                            filteredClients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{client.full_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">{client.gender || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{client.phone}</div>
                                        <div className="text-sm text-gray-500">{client.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {client.birth_date ? new Date(client.birth_date).toLocaleDateString('fr-FR') : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                                {client.purchases_count} achat{client.purchases_count > 1 ? 's' : ''}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openModal(client)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(client.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingClient ? 'Modifier le client' : 'Nouveau client'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prénom *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Genre
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date de naissance
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.birth_date}
                                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Téléphone *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Adresse
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingClient ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}