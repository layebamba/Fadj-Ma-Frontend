'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import Link from "next/link";

interface Stats {
    medicinesCount: number;
    lowStockCount: number;
    totalRevenue: number;
    medicinesAvailable: number;
    groupsCount: number;
    suppliersCount: number;
    clientsCount: number;
    usersCount: number;
    inventoryStatus: {
        status: 'Excellent' | 'Bien' | 'Moyen' | 'Critique';
        color: string;
    };
    salesReport: {
        quantitySold: number;
        invoicesGenerated: number;
    };
    topClient: {
        name: string;
        topProduct: string;
    };
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [revenuePeriod, setRevenuePeriod] = useState('janvier 2022');
    const [reportPeriod, setReportPeriod] = useState('janvier 2022');

    useEffect(() => {
        fetchStats();
    }, []);

    const calculateInventoryStatus = (medicinesList: any[]) => {
        if (medicinesList.length === 0) {
            return { status: 'Critique' as const, color: 'border-red-500' };
        }
        const lowStockCount = medicinesList.filter((m: any) => m.is_low_stock).length;
        const outOfStockCount = medicinesList.filter((m: any) => m.stock_quantity === 0).length;
        const problemPercentage = ((lowStockCount + outOfStockCount) / medicinesList.length) * 100;

        if (problemPercentage === 0) return { status: 'Excellent' as const, color: 'border-green-500' };
        if (problemPercentage < 10) return { status: 'Bien' as const, color: 'border-blue-500' };
        if (problemPercentage < 25) return { status: 'Moyen' as const, color: 'border-yellow-500' };
        return { status: 'Critique' as const, color: 'border-red-500' };
    };

    const fetchStats = async () => {
        try {
            const [medicines, groups, suppliers, clients, sales, users] = await Promise.all([
                api.get('/medicines/'),
                api.get('/medicine-groups/'),
                api.get('/suppliers/'),
                api.get('/clients/'),
                api.get('/sales/stats/'),
                api.get('/users/').catch(() => ({ data: [] })),
            ]);

            const medicinesList = medicines.data.results || medicines.data;
            const groupsList = groups.data.results || groups.data;
            const suppliersList = suppliers.data.results || suppliers.data;
            const clientsList = clients.data.results || clients.data;
            const usersList = users.data.results || users.data;

            const lowStock = medicinesList.filter((m: any) => m.is_low_stock).length;
            const available = medicinesList.filter((m: any) => m.stock_quantity > 0).length;
            const inventoryStatus = calculateInventoryStatus(medicinesList);

            setStats({
                medicinesCount: medicinesList.length,
                lowStockCount: lowStock,
                totalRevenue: parseFloat(sales.data.total?.total || '0'),
                medicinesAvailable: available,
                groupsCount: groupsList.length,
                suppliersCount: suppliersList.length,
                clientsCount: clientsList.length,
                usersCount: Array.isArray(usersList) ? usersList.length : 0,
                inventoryStatus,
                salesReport: {
                    quantitySold: sales.data.quantity_sold || 70856,
                    invoicesGenerated: sales.data.invoices_count || 5288,
                },
                topClient: {
                    name: clientsList[0]?.name || 'N/A',
                    topProduct: 'Adalimumab',
                },
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = () => {
        alert('Téléchargement du rapport en cours...');
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

    if (!stats) {
        return (
            <DashboardLayout>
                <div className="text-center text-red-600">Erreur de chargement des données</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header avec bouton télécharger */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                        <p className="text-gray-600 mt-1">Un aperçu rapide des données de votre pharmacie</p>
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                    >
                        Télécharger le rapport
                    </button>
                </div>

                {/* Stats Cards Grid avec bordures colorées */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className={`bg-white rounded-lg border-4 ${stats.inventoryStatus.color} overflow-hidden`}>
                        <div className="p-6 text-center space-y-3">
                            <div className="flex justify-center">
                                <svg className="w-16 h-16 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11.5 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                                    <path d="M9 13a1 1 0 112 0v2a1 1 0 11-2 0v-2z" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{stats.inventoryStatus.status}</div>
                            <div className="text-sm text-gray-600">Statut de l'inventaire</div>
                        </div>
                        <div className="border-t border-gray-200 px-6 py-3 h-14 bg-green-500">
                            <Link
                                href="/dashboard/medicines"
                                className="w-full text-sm text-gray-800 hover:text-gray-900 flex items-center justify-center gap-1"
                            >
                                Afficher le rapport détaillé
                                <span>≫</span>
                            </Link>
                        </div>
                    </div>
                    {/* Revenu - Icône billet */}
                    <div className="bg-white rounded-lg border-4 border-yellow-400 overflow-hidden">
                        <div className="p-6 text-center space-y-3">
                            <div className="flex justify-center">
                                <svg className="w-16 h-16 text-yellow-500" fill="currentColor" viewBox="0 0 128 128">
                                    <path d="M113.854 38.738h-6.391V32.27a1.749 1.749 0 0 0-1.75-1.75H14.146a1.75 1.75 0 0 0-1.75 1.75v55.242a1.75 1.75 0 0 0 1.75 1.75h6.391v6.468a1.749 1.749 0 0 0 1.75 1.75h91.567a1.75 1.75 0 0 0 1.75-1.75V40.488a1.75 1.75 0 0 0-1.75-1.75zM15.9 34.02h88.067v51.742H15.9zm96.2 59.96H24.037v-4.718h81.676a1.749 1.749 0 0 0 1.75-1.75V42.238h4.637z"/>
                                    <path d="M29.517 79.294a1.75 1.75 0 0 0 1.75 1.75h57.325a1.749 1.749 0 0 0 1.75-1.75 7.161 7.161 0 0 1 7.158-7.152 1.751 1.751 0 0 0 1.75-1.75v-21a1.751 1.751 0 0 0-1.75-1.75 7.16 7.16 0 0 1-7.153-7.152 1.749 1.749 0 0 0-1.75-1.75h-57.33a1.75 1.75 0 0 0-1.75 1.75 7.16 7.16 0 0 1-7.153 7.152 1.751 1.751 0 0 0-1.75 1.75v21a1.751 1.751 0 0 0 1.75 1.75 7.161 7.161 0 0 1 7.153 7.152zm57.469-37.056A10.682 10.682 0 0 0 95.745 51v17.785a10.68 10.68 0 0 0-8.759 8.759H71.555a21.117 21.117 0 0 0 0-35.306zM59.93 77.544a17.653 17.653 0 1 1 17.653-17.653A17.674 17.674 0 0 1 59.93 77.544zM24.114 51a10.683 10.683 0 0 0 8.76-8.759H48.3a21.117 21.117 0 0 0 0 35.306H32.874a10.682 10.682 0 0 0-8.76-8.759z"/>
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">
                                {stats.totalRevenue.toLocaleString('fr-FR')} FCFA
                            </div>
                            <div className="text-sm text-gray-600">
                                Revenu :
                                <select
                                    value={revenuePeriod}
                                    onChange={(e) => setRevenuePeriod(e.target.value)}
                                    className="ml-2 border-0 bg-transparent font-medium focus:outline-none cursor-pointer"
                                >
                                    <option>janvier 2022</option>
                                    <option>février 2022</option>
                                    <option>mars 2022</option>
                                </select>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 h-14 px-6 py-3 bg-yellow-500">
                            <Link
                                href="/dashboard/sales"
                                className="w-full text-sm text-gray-800 hover:text-gray-900 flex items-center justify-center gap-1"
                            >
                                Afficher le rapport détaillé
                                <span>≫</span>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border-4 border-blue-400 overflow-hidden">
                        <div className="p-6 text-center space-y-3">
                            <div className="flex justify-center">
                                <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm6 11h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z"/>
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{stats.medicinesAvailable}</div>
                            <div className="text-sm text-gray-600">Médicaments disponibles</div>
                        </div>
                        <div className="border-t border-gray-200 h-14 px-6 py-3 bg-blue-500">
                            <Link
                                href="/dashboard/medicines"
                                className="w-full text-sm text-gray-800 hover:text-gray-900 flex items-center justify-center gap-1"
                            >
                                Visiter l'inventaire
                                <span>≫</span>
                            </Link>
                        </div>
                    </div>
                    {/* Pénurie de médicaments */}
                    <div className="bg-white rounded-lg border-4 border-red-400 overflow-hidden">
                        <div className="p-6 text-center space-y-3">
                            <div className="flex justify-center">
                                <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">
                                {stats.lowStockCount.toString().padStart(2, '0')}
                            </div>
                            <div className="text-sm text-gray-600">Pénurie de médicaments</div>
                        </div>
                        <div className="border-t border-gray-200 h-14 px-6 py-3 bg-red-500">
                            <Link
                                href="/dashboard/medicines?filter=low_stock"
                                className="w-full text-sm text-red-700 hover:text-red-900 flex items-center justify-center gap-1"
                            >
                                Résoudre maintenant
                                <span>≫</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sections du bas */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Inventaire */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Inventaire</h2>
                            <a href="/dashboard/medicines" className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1">
                                Allez dans Configuration
                                <span>≫</span>
                            </a>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <div className="text-4xl font-bold text-gray-900 mb-1">{stats.medicinesCount}</div>
                                <div className="text-sm text-gray-600">Nombre total de médicaments</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-gray-900 mb-1">{stats.groupsCount}</div>
                                <div className="text-sm text-gray-600">Groupes de médecine</div>
                            </div>
                        </div>
                    </div>

                    {/* Rapport rapide */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Rapport rapide</h2>
                            <select
                                value={reportPeriod}
                                onChange={(e) => setReportPeriod(e.target.value)}
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option>janvier 2022</option>
                                <option>février 2022</option>
                                <option>mars 2022</option>
                                <option>avril 2022</option>
                                <option>mai 2022</option>
                                <option>juin 2022</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <div className="text-4xl font-bold text-gray-900 mb-1">
                                    {stats.salesReport.quantitySold.toLocaleString('fr-FR')}
                                </div>
                                <div className="text-sm text-gray-600">Quantité de médicaments vendus</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-gray-900 mb-1">
                                    {stats.salesReport.invoicesGenerated.toLocaleString('fr-FR')}
                                </div>
                                <div className="text-sm text-gray-600">Factures générées</div>
                            </div>
                        </div>
                    </div>

                    {/* Ma pharmacie */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Ma pharmacie</h2>
                            <a href="/dashboard/users" className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1">
                                Accédez à la gestion des utilisateurs
                                <span>≫</span>
                            </a>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <div className="text-4xl font-bold text-gray-900 mb-1">
                                    {stats.suppliersCount.toString().padStart(2, '0')}
                                </div>
                                <div className="text-sm text-gray-600">Nombre total de fournisseurs</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-gray-900 mb-1">
                                    {stats.usersCount.toString().padStart(2, '0')}
                                </div>
                                <div className="text-sm text-gray-600">Nombre total d'utilisateurs</div>
                            </div>
                        </div>
                    </div>

                    {/* Clients */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Clients</h2>
                            <a href="/dashboard/clients" className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1">
                                Aller à la page clients
                                <span>≫</span>
                            </a>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <div className="text-4xl font-bold text-gray-900 mb-1">{stats.clientsCount}</div>
                                <div className="text-sm text-gray-600">Nombre total de clients</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.topClient.topProduct}</div>
                                <div className="text-sm text-gray-600">Article fréquemment acheté</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}