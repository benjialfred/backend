import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import ChartPagination from '../Dashboard/admin/ChartPagination';
import { CustomTooltip } from './DashboardCharts';

export default function SalesChart() {
    const { statsHistory, loading } = useDashboardData();
    const [salesView, setSalesView] = useState<'month' | 'year'>('month');
    const [salesPage, setSalesPage] = useState(0);
    const ITEMS_PER_PAGE = 10;

    if (loading) return null;

    const { monthly_orders, yearly_orders } = statsHistory;
    const salesDataRaw = salesView === 'month' ? monthly_orders : yearly_orders;
    const allSalesData = salesDataRaw || [];
    const totalSalesPages = Math.ceil(allSalesData.length / ITEMS_PER_PAGE);
    const displayedSales = allSalesData.slice(salesPage * ITEMS_PER_PAGE, (salesPage + 1) * ITEMS_PER_PAGE);

    return (
        <div className="glass-panel p-6 group relative border border-white/5 hover:border-accent-500/30 transition-colors duration-500 rounded-3xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent-500/10 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">Analyse des Ventes <span className="text-accent-400 animate-pulse ml-1">●</span></h3>
                    <p className="text-[10px] text-gray-400 mt-1">Volume des transactions en temps réel</p>
                </div>
                <div className="flex items-center gap-4">
                    <ChartPagination
                        currentPage={salesPage}
                        totalPages={totalSalesPages}
                        onPageChange={setSalesPage}
                    />
                    <div className="flex bg-gray-100 dark:bg-dark-950 rounded-lg p-1 border border-gray-200 dark:border-white/10 shadow-inner">
                        <button onClick={() => { setSalesView('month'); setSalesPage(0); }} className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${salesView === 'month' ? 'bg-primary-600 text-white shadow-[0_0_10px_rgba(14,165,233,0.5)]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Mois</button>
                        <button onClick={() => { setSalesView('year'); setSalesPage(0); }} className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${salesView === 'year' ? 'bg-accent-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Année</button>
                    </div>
                </div>
            </div>
            <div className="h-[220px] relative z-10 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayedSales} barSize={24}>
                        <defs>
                            <linearGradient id="colorSalesBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(150,150,150,0.05)' }} />
                        <Bar dataKey="orders" name="Commandes" fill="url(#colorSalesBar)" radius={[6, 6, 0, 0]} className="hover:opacity-80 transition-opacity" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {displayedSales.length === 0 && (
                <div className="text-center text-gray-500 dark:text-primary-300 text-sm mt-4 font-medium italic relative z-10">Synchronisation des données en cours...</div>
            )}
        </div>
    );
}
