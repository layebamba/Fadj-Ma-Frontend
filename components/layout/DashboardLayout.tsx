'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {isAdmin} from "@/lib/roleUtils";
import { useRef } from 'react';
import api from "@/lib/api";

interface NavItem {
    name: string;
    href: string;
    icon: string;
}
interface SearchResult {
    id: number;
    name: string;
    type: 'medicine' | 'client' | 'supplier' | 'group';
    link: string;
    subtitle?: string;
}

const navigation: NavItem[] = [
    { name: 'Tableau de bord', href: '/dashboard', icon: '📊' },
    { name: 'Médicaments', href: '/dashboard/medicines', icon: '💊' },
    { name: 'Groupes', href: '/dashboard/groups', icon: '📁' },
    { name: 'Fournisseurs', href: '/dashboard/suppliers', icon: '🏢' },
    { name: 'Clients', href: '/dashboard/clients', icon: '👥' },
    { name: 'Ventes', href: '/dashboard/sales', icon: '🛒' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const pathname = usePathname();
    const { user, logout } = useAuth();
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const date = now.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            const time = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            setCurrentTime(`${date} - ${time}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
        if (!user) {
            router.push('/login');
        } else if (!isAdmin(user)) {
            router.push('/medicines');
        }

    }, [user,router]);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Fonction de recherche
    useEffect(() => {
        const searchTimeout = setTimeout(async () => {
            if (globalSearch.trim().length < 2) {
                setSearchResults([]);
                setShowResults(false);
                return;
            }

            setSearching(true);
            setShowResults(true);

            try {
                const searchTerm = globalSearch.toLowerCase();
                const results: SearchResult[] = [];

                // Rechercher dans médicaments
                const medicinesRes = await api.get('/medicines/');
                const medicines = medicinesRes.data.results || medicinesRes.data;
                medicines
                    .filter((m: any) =>
                        m?.name?.toLowerCase().includes(searchTerm) ||
                        m?.medicine_id?.toLowerCase().includes(searchTerm)
                    )
                    .slice(0, 3)
                    .forEach((m: any) => {
                        if (m?.name) {
                            results.push({
                                id: m.id,
                                name: m.name,
                                type: 'medicine',
                                link: `/dashboard/medicines/${m.id}`,
                                subtitle: `ID: ${m.medicine_id || ''}`
                            });
                        }
                    });

                // Rechercher dans clients
                const clientsRes = await api.get('/clients/');
                const clients = clientsRes.data.results || clientsRes.data;
                clients
                    .filter((c: any) => c?.name?.toLowerCase().includes(searchTerm))
                    .slice(0, 3)
                    .forEach((c: any) => {
                        if (c?.name) {
                            results.push({
                                id: c.id,
                                name: c.name,
                                type: 'client',
                                link: `/dashboard/clients/${c.id}`,
                                subtitle: c.phone || ''
                            });
                        }
                    });

                // Rechercher dans fournisseurs
                const suppliersRes = await api.get('/suppliers/');
                const suppliers = suppliersRes.data.results || suppliersRes.data;
                suppliers
                    .filter((s: any) => s?.name?.toLowerCase().includes(searchTerm))
                    .slice(0, 3)
                    .forEach((s: any) => {
                        if (s?.name) {
                            results.push({
                                id: s.id,
                                name: s.name,
                                type: 'supplier',
                                link: `/dashboard/suppliers/${s.id}`,
                                subtitle: s.phone || ''
                            });
                        }
                    });

                setSearchResults(results);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(searchTimeout);
    }, [globalSearch]);
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-64 bg-[#2C3E50] text-white flex flex-col">
                        {/* Header */}
                        <div className="flex items-center gap-2 px-4 h-16 border-b border-gray-700">
                            <span className="text-2xl">🛒</span>
                            <span className="text-xl font-bold">Fadj-Ma</span>
                            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white">✕</button>
                        </div>

                        {/* User Info */}
                        <div className="px-4 py-4 border-b border-gray-700">
                            <div className="flex items-center gap-3">
                                <img
                                    src={user?.avatar || '/default-avatar.png'}
                                    alt="Avatar"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{user?.full_name}</p>
                                    <p className="text-xs text-yellow-400">{user?.role_display}</p>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="text-white hover:text-gray-300"
                                    >
                                        ⋮
                                    </button>

                                    {/* Dropdown Menu Mobile */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                                            <Link
                                                href="/dashboard/profile"
                                                onClick={() => {
                                                    setUserMenuOpen(false);
                                                    setSidebarOpen(false);
                                                }}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Mon profil
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-2 py-4 overflow-y-auto">
                            {navigation
                                .filter((item) => {
                                    if (user && isAdmin(user)) return true;
                                    return item.href === '/dashboard/medicines';
                                })
                                .map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 rounded px-3 py-2 text-sm ${
                                                isActive ? 'bg-teal-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                                            }`}
                                        >
                                            <span>{item.icon}</span>
                                            {item.name}
                                        </Link>
                                    );
                                })}
                        </nav>

                        {/* Footer Déconnexion */}
                        <div className="border-t border-gray-700">
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 px-4 py-3 w-full text-left text-white hover:bg-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                </svg>
                                Déconnexion
                            </button>
                            <p className="text-xs text-gray-400 text-center py-3">
                                Propulsé par Red Team © 2024 version 1.1.2
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col h-full bg-[#2C3E50] text-white">
                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 h-16 border-b border-gray-700">
                        <span className="text-2xl">🛒</span>
                        <span className="text-xl font-bold">Fadj-Ma</span>
                    </div>

                    {/* User Info */}
                    <div className="px-4 py-4 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="Avatar"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="text-sm font-medium">{user?.full_name}</p>
                                <p className="text-xs text-yellow-400">{user?.role_display}</p>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="text-white hover:text-gray-300"
                                >
                                    ⋮
                                </button>

                                {/* Dropdown Menu Desktop */}
                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                                            <Link
                                                href="/dashboard/profile"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Mon profil
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-4 overflow-y-auto">
                        {navigation
                            .filter((item) => {
                                if (user && isAdmin(user)) return true;
                                return item.href === '/dashboard/medicines';
                            })
                            .map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded px-3 py-2 text-sm ${
                                            isActive ? 'bg-teal-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        <span>{item.icon}</span>
                                        {item.name}
                                    </Link>
                                );
                            })}
                    </nav>
                    {/* Footer Déconnexion */}
                    <div className="border-t border-gray-700">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 w-full text-left text-white hover:bg-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                            Déconnexion
                        </button>
                        <p className="text-xs text-gray-400 text-center py-3">
                            Propulsé par Red Team © 2024 version 1.1.2
                        </p>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Topbar */}
                <div className="sticky top-0 z-40 flex items-center justify-between h-16 bg-white border-b px-4">
                    {/* Menu mobile */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-500 lg:hidden"
                    >
                        ☰
                    </button>

                    {/* Recherche globale - centrée */}
                    <div className="flex-1 flex items-center px-4" ref={searchRef}>
                        <div className="relative w-full max-w-xl">
                            <input
                                type="text"
                                placeholder="Recherchez n'importe quoi ici."
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
                                className="w-full bg-gray-100 border-0 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute right-3 top-2.5 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>

                            {/* Résultats de recherche */}
                            {showResults && (
                                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                                    {searching ? (
                                        <div className="p-4 text-center text-gray-500">Recherche...</div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="py-2">
                                            {searchResults.map((result) => (
                                                <Link
                                                    key={`${result.type}-${result.id}`}
                                                    href={result.link}
                                                    onClick={() => {
                                                        setShowResults(false);
                                                        setGlobalSearch('');
                                                    }}
                                                    className="block px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                                                >
                                                    <div className="flex items-center gap-3">
                                    <span className="text-xl">
                                        {result.type === 'medicine' && '💊'}
                                        {result.type === 'client' && '👤'}
                                        {result.type === 'supplier' && '🏢'}
                                        {result.type === 'group' && '📁'}
                                    </span>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{result.name}</div>
                                                            {result.subtitle && (
                                                                <div className="text-xs text-gray-500">{result.subtitle}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">Aucun résultat trouvé</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Actions à droite */}
                    <div className="flex items-center gap-4">
                        {/* Sélecteur de langue */}
                        <div className="hidden md:flex items-center gap-2 text-sm text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                            </svg>
                            <select className="bg-transparent border-0 focus:outline-none cursor-pointer">
                                <option>Français (France)</option>
                                <option>English (US)</option>
                            </select>
                        </div>

                        {/* Bonjour avec indicateur */}
                        <div className="hidden md:flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                            <span className="text-sm text-gray-700">Bonjour</span>
                        </div>

                        {/* Date et heure */}
                        <div className="hidden lg:block text-sm text-gray-600">
                            {currentTime || 'Chargement...'}
                        </div>

                        {/* Bouton déconnexion */}
                        <button
                            onClick={logout}
                            className="text-gray-500 hover:text-gray-700"
                            title="Déconnexion"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Page content */}
                <main className="py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}