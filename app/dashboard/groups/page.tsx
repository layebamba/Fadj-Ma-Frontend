'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

interface MedicineGroup {
    id: number;
    name: string;
    description: string;
    medicines_count: number;
    created_at: string;
    updated_at: string;
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<MedicineGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState<MedicineGroup | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await api.get('/medicine-groups/');
            setGroups(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingGroup) {
                await api.put(`/medicine-groups/${editingGroup.id}/`, formData);
            } else {
                await api.post('/medicine-groups/', formData);
            }
            fetchGroups();
            closeModal();
        } catch (error) {
            console.error('Error saving group:', error);
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) return;

        try {
            await api.delete(`/medicine-groups/${id}/`);
            fetchGroups();
        } catch (error) {
            console.error('Error deleting group:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const openModal = (group?: MedicineGroup) => {
        if (group) {
            setEditingGroup(group);
            setFormData({
                name: group.name,
                description: group.description
            });
        } else {
            setEditingGroup(null);
            setFormData({
                name: '',
                description: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingGroup(null);
        setFormData({
            name: '',
            description: ''
        });
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase()) ||
        group.description.toLowerCase().includes(search.toLowerCase())
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
                        <h1 className="text-3xl font-bold text-gray-900">Groupes de médicaments</h1>
                        <p className="text-gray-600 mt-1">Gérez les groupes et catégories de médicaments</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        + Nouveau groupe
                    </button>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Total des groupes</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{groups.length}</div>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Total des médicaments</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {groups.reduce((sum, g) => sum + g.medicines_count, 0)}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Groupes vides</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {groups.filter(g => g.medicines_count === 0).length}
                        </div>
                    </div>
                </div>

                {/* Recherche */}
                <div className="bg-white rounded-lg border p-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher un groupe..."
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
                                Nom du groupe
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Médicaments
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date de création
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredGroups.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Aucun groupe trouvé
                                </td>
                            </tr>
                        ) : (
                            filteredGroups.map((group) => (
                                <tr key={group.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{group.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 max-w-xs truncate">
                                            {group.description || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {group.medicines_count} médicament{group.medicines_count > 1 ? 's' : ''}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(group.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openModal(group)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(group.id)}
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingGroup ? 'Modifier le groupe' : 'Nouveau groupe'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom du groupe *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
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
                                    {editingGroup ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}