'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';

interface MedicineGroup {
    id: number;
    name: string;
}

interface Supplier {
    id: number;
    name: string;
}

export default function CreateMedicine() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dosage_info: '',
        selling_price: 0,
        composition: '',
        manufacturer: '',
        consumption_type: 'oral',
        expiration_date: '',
        pharmaceutical_form: 'comprime',
        purchase_price: 0,
        stock_quantity: 0,
        min_stock_alert: 10,
        active_ingredients: '',
        side_effects: '',
        group: null as number | null,
        supplier: null as number | null,
        image: null as File | null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [groups, setGroups] = useState<MedicineGroup[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [groupsRes, suppliersRes] = await Promise.all([
                    api.get('/medicine-groups/'),
                    api.get('/suppliers/')
                ]);

                const groupsData = Array.isArray(groupsRes.data)
                    ? groupsRes.data
                    : groupsRes.data.results || [];

                const suppliersData = Array.isArray(suppliersRes.data)
                    ? suppliersRes.data
                    : suppliersRes.data.results || [];

                setGroups(groupsData);
                setSuppliers(suppliersData);
            } catch (err) {
                console.error('Erreur chargement données', err);
                setGroups([]);
                setSuppliers([]);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: ['selling_price', 'purchase_price', 'stock_quantity', 'min_stock_alert'].includes(name)
                ? Number(value)
                : ['group', 'supplier'].includes(name)
                    ? value ? Number(value) : null
                    : value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            const file = e.target.files[0];
            setFormData((prev) => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value === null || value === '') return;
                if (key === 'image' && value instanceof File) {
                    data.append(key, value);
                } else {
                    data.append(key, value.toString());
                }
            });

            await api.post('/medicines/', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            router.push('/dashboard/medicines');
        } catch (err) {
            console.error('Erreur création médicament', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/medicines');
    };

    // Style commun pour les inputs
    const inputClass = "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-yellow-400 transition-colors";

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
                <h1 className="text-2xl font-bold mb-6 text-center">Ajouter un Médicament</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image */}
                    <div className="flex flex-col items-center mb-6">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Aperçu image"
                                className="w-24 h-24 object-cover rounded border mb-2"
                            />
                        ) : (
                            <label
                                className="flex flex-col items-center justify-center w-24 h-24 bg-gray-100 rounded-full cursor-pointer mb-2 hover:bg-gray-200"
                                aria-label="Ajouter une image"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-8 h-8 text-gray-500"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </label>
                        )}
                        <span className="text-sm text-gray-600">{imagePreview ? formData.image?.name : 'Ajouter une image'}</span>
                    </div>

                    {/* TOUS les champs en grille 2 colonnes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Nom du médicament *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Fabricant *</label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Groupe</label>
                            <select
                                name="group"
                                value={formData.group || ''}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="">-- Sélectionner --</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Fournisseur</label>
                            <select
                                name="supplier"
                                value={formData.supplier || ''}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="">-- Sélectionner --</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Forme pharmaceutique *</label>
                            <select
                                name="pharmaceutical_form"
                                value={formData.pharmaceutical_form}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            >
                                <option value="comprime">Comprimé</option>
                                <option value="gelule">Gélule</option>
                                <option value="sirop">Sirop</option>
                                <option value="creme">Crème</option>
                                <option value="pommade">Pommade</option>
                                <option value="injection">Injection</option>
                                <option value="gouttes">Gouttes</option>
                                <option value="suppositoire">Suppositoire</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Type de consommation *</label>
                            <select
                                name="consumption_type"
                                value={formData.consumption_type}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            >
                                <option value="oral">Oral</option>
                                <option value="injection">Injection</option>
                                <option value="topique">Topique</option>
                                <option value="inhalation">Inhalation</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Date d'expiration *</label>
                            <input
                                type="date"
                                name="expiration_date"
                                value={formData.expiration_date}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Prix d'achat (FCFA) *</label>
                            <input
                                type="number"
                                name="purchase_price"
                                value={formData.purchase_price}
                                min={0}
                                step={0.01}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Prix de vente (FCFA) *</label>
                            <input
                                type="number"
                                name="selling_price"
                                value={formData.selling_price}
                                min={0}
                                step={0.01}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Stock initial *</label>
                            <input
                                type="number"
                                name="stock_quantity"
                                value={formData.stock_quantity}
                                min={0}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Seuil d'alerte stock *</label>
                            <input
                                type="number"
                                name="min_stock_alert"
                                value={formData.min_stock_alert}
                                min={0}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Composition *</label>
                            <textarea
                                name="composition"
                                value={formData.composition}
                                onChange={handleChange}
                                rows={2}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={2}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Dosage et posologie</label>
                            <textarea
                                name="dosage_info"
                                value={formData.dosage_info}
                                onChange={handleChange}
                                rows={2}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Ingrédients actifs</label>
                            <textarea
                                name="active_ingredients"
                                value={formData.active_ingredients}
                                onChange={handleChange}
                                rows={2}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Effets secondaires</label>
                            <textarea
                                name="side_effects"
                                value={formData.side_effects}
                                onChange={handleChange}
                                rows={2}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    {/* Boutons */}
                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 rounded border border-gray-300 hover:bg-gray-100"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {submitting ? 'Création...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}