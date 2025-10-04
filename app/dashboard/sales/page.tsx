'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';

interface Sale {
    id: number;
    sale_number: string;
    client: number;
    client_name: string;
    total_amount: number;
    payment_method: string;
    notes: string;
    sold_by: number;
    sold_by_name: string;
    created_at: string;
    items: SaleItem[];
}

interface SaleItem {
    id: number;
    medicine: number;
    medicine_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface Client {
    id: number;
    full_name: string;
}

interface Medicine {
    id: number;
    name: string;
    selling_price: number;
    stock_quantity: number;
}

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        client: '',
        payment_method: 'CASH',
        notes: '',
        items: [{ medicine: '', quantity: 1, unit_price: 0 }]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [salesRes, clientsRes, medicinesRes] = await Promise.all([
                api.get('/sales/'),
                api.get('/clients/'),
                api.get('/medicines/')
            ]);
            setSales(salesRes.data.results || salesRes.data);
            setClients(clientsRes.data.results || clientsRes.data);
            setMedicines(medicinesRes.data.results || medicinesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/sales/', formData);
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Error creating sale:', error);
            alert('Erreur lors de la création de la vente');
        }
    };

    const openModal = () => {
        setFormData({
            client: '',
            payment_method: 'CASH',
            notes: '',
            items: [{ medicine: '', quantity: 1, unit_price: 0 }]
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { medicine: '', quantity: 1, unit_price: 0 }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'medicine') {
            const medicine = medicines.find(m => m.id === parseInt(value));
            if (medicine) {
                newItems[index].unit_price = medicine.selling_price;
            }
        }

        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => {
            return sum + (item.quantity * item.unit_price);
        }, 0);
    };

    const filteredSales = sales.filter(sale =>
        sale.sale_number.toLowerCase().includes(search.toLowerCase()) ||
        sale.client_name.toLowerCase().includes(search.toLowerCase())
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
                        <h1 className="text-3xl font-bold text-gray-900">Ventes</h1>
                        <p className="text-gray-600 mt-1">Gérez vos ventes et factures</p>
                    </div>
                    <button
                        onClick={openModal}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        + Nouvelle vente
                    </button>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Total des ventes</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{sales.length}</div>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Chiffre d'affaires</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {sales.reduce((sum, s) => sum + s.total_amount, 0).toLocaleString('fr-FR')} FCFA
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Ventes aujourd'hui</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {sales.filter(s => {
                                const date = new Date(s.created_at);
                                const today = new Date();
                                return date.toDateString() === today.toDateString();
                            }).length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Panier moyen</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {sales.length > 0 ? Math.round(sales.reduce((sum, s) => sum + s.total_amount, 0) / sales.length).toLocaleString('fr-FR') : 0} FCFA
                        </div>
                    </div>
                </div>

                {/* Recherche */}
                <div className="bg-white rounded-lg border p-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher par numéro de vente ou client..."
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
                                N° Vente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Montant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Paiement
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vendu par
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSales.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Aucune vente trouvée
                                </td>
                            </tr>
                        ) : (
                            filteredSales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{sale.sale_number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{sale.client_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-green-600">
                                            {sale.total_amount.toLocaleString('fr-FR')} FCFA
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {sale.payment_method}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {sale.sold_by_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(sale.created_at).toLocaleDateString('fr-FR')}
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Nouvelle vente</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Client *
                                    </label>
                                    <select
                                        value={formData.client}
                                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Sélectionner un client</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mode de paiement *
                                    </label>
                                    <select
                                        value={formData.payment_method}
                                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="CASH">Espèces</option>
                                        <option value="CARD">Carte bancaire</option>
                                        <option value="MOBILE">Mobile money</option>
                                        <option value="CREDIT">Crédit</option>
                                    </select>
                                </div>
                            </div>

                            {/* Articles */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Articles *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        + Ajouter un article
                                    </button>
                                </div>
                                {formData.items.map((item, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <select
                                            value={item.medicine}
                                            onChange={(e) => updateItem(index, 'medicine', e.target.value)}
                                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Médicament</option>
                                            {medicines.map(med => (
                                                <option key={med.id} value={med.id}>
                                                    {med.name} (Stock: {med.stock_quantity})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                            min="1"
                                            className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Qté"
                                            required
                                        />
                                        <input
                                            type="number"
                                            value={item.unit_price}
                                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                                            min="0"
                                            className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Prix"
                                            required
                                        />
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Total */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">Total:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {calculateTotal().toLocaleString('fr-FR')} FCFA
                                    </span>
                                </div>
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
                                    Créer la vente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}