'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {isAdmin} from "@/lib/roleUtils";
import {useAuth} from "@/contexts/AuthContext";


interface Medicine {
    id: number;
    name: string;
    medicine_id: string;
    stock_quantity: number;
    group: number | null;
    group_detail?: {
        id: number;
        name: string;
    };
    supplier_detail?: {
        id: number;
        name: string;
    };
}

interface MedicineGroup {
    id: number;
    name: string;
}

export default function MedicinesPage() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
    const [groups, setGroups] = useState<MedicineGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [toDelete, setToDelete] = useState<Medicine | null>(null);
    const { user } = useAuth();
    const userIsAdmin = user ? isAdmin(user) : false;
    // Filtres et pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [medicinesRes, groupsRes] = await Promise.all([
                api.get('/medicines/'),
                api.get('/medicine-groups/')
            ]);

            const medicinesData = medicinesRes.data.results || medicinesRes.data;
            const groupsData = Array.isArray(groupsRes.data) ? groupsRes.data : groupsRes.data.results || [];

            setMedicines(medicinesData);
            setFilteredMedicines(medicinesData);
            setGroups(groupsData);
        } catch (error) {
            console.error('Erreur lors du chargement des données', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrage
    useEffect(() => {
        let result = [...medicines];

        if (searchTerm) {
            result = result.filter(m =>
                m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.medicine_id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedGroup) {
            result = result.filter(m => m.group === Number(selectedGroup));
        }

        setFilteredMedicines(result);
        setCurrentPage(1);
    }, [searchTerm, selectedGroup, medicines]);

    // Pagination
    const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMedicines = filteredMedicines.slice(startIndex, startIndex + itemsPerPage);

    const confirmDelete = (medicine: Medicine) => {
        setToDelete(medicine);
    };

    const cancelDelete = () => {
        setToDelete(null);
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await api.delete(`/medicines/${toDelete.id}/`);
            setMedicines((prev) => prev.filter((m) => m.id !== toDelete.id));
            setToDelete(null);
        } catch (error) {
            console.error('Erreur suppression', error);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">Chargement...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">médicaments ({filteredMedicines.length})</h1>
                        <p className="text-sm text-gray-600">Liste des médicaments disponibles à la vente.</p>
                    </div>
                    <button
                        onClick={() => userIsAdmin && (window.location.href = '/dashboard/medicines/create')}
                        disabled={!userIsAdmin}
                        className={`flex items-center gap-2 px-4 py-2 rounded ${
                            userIsAdmin
                                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        title={!userIsAdmin ? 'Action réservée aux administrateurs' : ''}
                    >
                        <span>+</span>
                        Nouveau médicament
                    </button>
                </div>

                {/* Filtres */}
                <div className="flex justify-between items-center gap-4">
                    <div className="relative w-96">
                        <input
                            type="text"
                            placeholder="Rechercher dans l'inventaire des médicaments."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-blue-500"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute right-3 top-2.5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>

                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                        </svg>
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 w-52 py-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Sélectionnez un groupe</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tableau */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nom du médicament
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID du médicament
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nom de groupe
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock en quantité
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedMedicines.map((medicine) => (
                            <tr key={medicine.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {medicine.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {medicine.medicine_id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {medicine.group_detail?.name || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            medicine.stock_quantity <= 5
                                                ? 'bg-red-100 text-red-800'
                                                : medicine.stock_quantity <= 10
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                        }`}
                                    >
                                        {medicine.stock_quantity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-3">
                                        <Link href={`/dashboard/medicines/${medicine.id}`} title="Voir détails">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 hover:text-blue-800 cursor-pointer">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </Link>
                                        <button
                                            onClick={() => userIsAdmin && (window.location.href = `/dashboard/medicines/edit/${medicine.id}`)}
                                            disabled={!userIsAdmin}
                                            title={!userIsAdmin ? 'Action réservée aux administrateurs' : 'Modifier'}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                                                 className={`w-5 h-5 ${userIsAdmin ? 'text-yellow-600 hover:text-yellow-800 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => userIsAdmin && confirmDelete(medicine)}
                                            disabled={!userIsAdmin}
                                            title={!userIsAdmin ? 'Action réservée aux administrateurs' : 'Supprimer'}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                                                 className={`w-5 h-5 ${userIsAdmin ? 'text-red-600 hover:text-red-800 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Précédent
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Suivant
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredMedicines.length)}</span> sur{' '}
                                    <span className="font-medium">{filteredMedicines.length}</span> résultats
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Précédent</span>
                                        ‹
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                currentPage === i + 1
                                                    ? 'z-10 bg-blue-600 text-white'
                                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Suivant</span>
                                        ›
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal confirmation suppression */}
                {toDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="fixed inset-0 bg-black/40" onClick={cancelDelete} />
                        <div className="relative bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 z-10">
                            <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Êtes-vous sûr de vouloir supprimer <span className="font-medium">{toDelete.name}</span> ? Cette action est irréversible.
                            </p>

                            <div className="mt-4 flex justify-end gap-3">
                                <button
                                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                    onClick={cancelDelete}
                                    disabled={deleting}
                                >
                                    Annuler
                                </button>
                                <button
                                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? 'Suppression...' : 'Supprimer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}