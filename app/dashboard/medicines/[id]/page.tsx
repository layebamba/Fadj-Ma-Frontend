'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';

interface Medicine {
    id: number;
    name: string;
    medicine_id: string;
    description: string;
    dosage_info: string;
    selling_price: number;
    stock_quantity: number;
    min_stock_alert: number;
    composition: string;
    manufacturer: string;
    consumption_type: string;
    expiration_date: string;
    pharmaceutical_form: string;
    purchase_price: number;
    active_ingredients: string;
    side_effects: string;
    is_low_stock: boolean;
    profit_margin: number;
    image?: string;
    group_detail?: { id: number; name: string };
    supplier_detail?: { id: number; name: string };
    created_by_name: string;
    created_at: string;
    updated_at: string;
}

export default function MedicineDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [medicine, setMedicine] = useState<Medicine | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedicine();
    }, [params.id]);

    const fetchMedicine = async () => {
        try {
            const response = await api.get(`/medicines/${params.id}/`);
            setMedicine(response.data);
        } catch (error) {
            console.error('Erreur chargement médicament', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">Chargement...</div>
            </DashboardLayout>
        );
    }

    if (!medicine) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">Médicament non trouvé</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Détails du Médicament</h1>
                    <div className="flex gap-2">
                        <Link
                            href={`/dashboard/medicines/edit/${medicine.id}`}
                            className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                        >
                            Modifier
                        </Link>
                        <Link
                            href="/dashboard/medicines"
                            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                        >
                            Retour
                        </Link>
                    </div>
                </div>

                {/* Image */}
                {medicine.image && (
                    <div className="flex justify-center mb-6">
                        <img
                            src={medicine.image}
                            alt={medicine.name}
                            className="w-40 h-40 object-cover rounded border"
                        />
                    </div>
                )}

                {/* Informations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Nom du médicament</label>
                        <p className="mt-1 text-lg font-semibold">{medicine.name}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">ID du médicament</label>
                        <p className="mt-1 text-lg">{medicine.medicine_id}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Fabricant</label>
                        <p className="mt-1">{medicine.manufacturer}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Groupe</label>
                        <p className="mt-1">{medicine.group_detail?.name || '-'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Fournisseur</label>
                        <p className="mt-1">{medicine.supplier_detail?.name || '-'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Forme pharmaceutique</label>
                        <p className="mt-1 capitalize">{medicine.pharmaceutical_form}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Type de consommation</label>
                        <p className="mt-1 capitalize">{medicine.consumption_type}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Date d'expiration</label>
                        <p className="mt-1">{new Date(medicine.expiration_date).toLocaleDateString('fr-FR')}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Prix d'achat</label>
                        <p className="mt-1">{medicine.purchase_price.toLocaleString()} FCFA</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Prix de vente</label>
                        <p className="mt-1 font-semibold text-green-600">{medicine.selling_price.toLocaleString()} FCFA</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Marge bénéficiaire</label>
                        <p className="mt-1 font-semibold text-blue-600">{medicine.profit_margin.toFixed(2)}%</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Stock actuel</label>
                        <p className={`mt-1 font-semibold ${medicine.is_low_stock ? 'text-red-600' : 'text-green-600'}`}>
                            {medicine.stock_quantity} {medicine.is_low_stock && '⚠️ Stock faible'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Seuil d'alerte</label>
                        <p className="mt-1">{medicine.min_stock_alert}</p>
                    </div>
                </div>

                {/* Champs longs */}
                <div className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Composition</label>
                        <p className="mt-1 text-gray-800">{medicine.composition || '-'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Description</label>
                        <p className="mt-1 text-gray-800">{medicine.description || '-'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Dosage et posologie</label>
                        <p className="mt-1 text-gray-800">{medicine.dosage_info || '-'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Ingrédients actifs</label>
                        <p className="mt-1 text-gray-800">{medicine.active_ingredients || '-'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Effets secondaires</label>
                        <p className="mt-1 text-gray-800">{medicine.side_effects || '-'}</p>
                    </div>
                </div>

                {/* Métadonnées */}
                <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                        <span className="font-medium">Créé par:</span> {medicine.created_by_name || 'N/A'}
                    </div>
                    <div>
                        <span className="font-medium">Créé le:</span> {new Date(medicine.created_at).toLocaleString('fr-FR')}
                    </div>
                    <div className="col-span-2">
                        <span className="font-medium">Dernière modification:</span> {new Date(medicine.updated_at).toLocaleString('fr-FR')}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}