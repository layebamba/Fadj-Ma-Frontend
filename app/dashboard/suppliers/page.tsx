'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

interface Supplier {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    medicines_count: number;
    created_at: string;
    updated_at: string;
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/suppliers/');
            setSuppliers(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await api.put(`/suppliers/${editingSupplier.id}/`, formData);
            } else {
                await api.post('/suppliers/', formData);
            }
            fetchSuppliers();
            closeModal();
        } catch (error) {
            console.error('Error saving supplier:', error);
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) return;

        try {
            await api.delete(`/suppliers/${id}/`);
            fetchSuppliers();
        } catch (error) {
            console.error('Error deleting supplier:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const openModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                phone: supplier.phone,
                email: supplier.email,
                address: supplier.address
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                phone: '',
                email: '',
                address: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSupplier(null);
        setFormData({
            name: '',
            phone: '',
            email: '',
            address: ''
        });
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(search.toLowerCase()) ||
        supplier.email.toLowerCase().includes(search.toLowerCase()) ||
        supplier.phone.includes(search)
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
                        <h1 className="text-3xl font-bold text-gray-900">Fournisseurs</h1>
                        <p className="text-gray-600 mt-1">Gérez vos fournisseurs de médicaments</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        + Nouveau fournisseur
                    </button>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Total des fournisseurs</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{suppliers.length}</div>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Médicaments fournis</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {suppliers.reduce((sum, s) => sum + s.medicines_count, 0)}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Fournisseurs actifs</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {suppliers.filter(s => s.medicines_count > 0).length}
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
                                Nom
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Adresse
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Médicaments
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSuppliers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Aucun fournisseur trouvé
                                </td>
                            </tr>
                        ) : (
                            filteredSuppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{supplier.phone}</div>
                                        <div className="text-sm text-gray-500">{supplier.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 max-w-xs truncate">
                                            {supplier.address || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                {supplier.medicines_count} médicament{supplier.medicines_count > 1 ? 's' : ''}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openModal(supplier)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(supplier.id)}
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
                            {editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom *
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
                                    {editingSupplier ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}