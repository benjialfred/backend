import { useState } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { motion } from 'framer-motion';
import ChartPagination from '../Dashboard/admin/ChartPagination';

// Premium Luxury Colors (Gold, Beige, Dark contrast)
const COLORS = ['#D4AF37', '#E5E4E2', '#8B7355', '#C0C0C0', '#F5ECE1', '#2C3E50'];

export const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[#111] p-4 border border-gray-100 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-2xl text-gray-900 dark:text-white min-w-[160px] backdrop-blur-xl">
                <p className="text-[10px] font-bold mb-3 text-gray-400 uppercase tracking-widest">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="text-sm flex items-center justify-between gap-6 mb-2 last:mb-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}` }} />
                            <span className="text-gray-600 dark:text-gray-300 font-medium">{entry.name}</span>
                        </div>
                        <span className="font-serif font-bold text-base">
                            {typeof entry.value === 'number' && entry.value > 1000
                                ? entry.value.toLocaleString()
                                : entry.value}
                            {entry.payload.percent && <span className="text-gray-400 ml-1 text-xs font-normal font-sans">({(entry.payload.percent * 100).toFixed(0)}%)</span>}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardCharts = () => {
    const { statsHistory, loading } = useDashboardData();
    const [productsPage, setProductsPage] = useState(0);
    const ITEMS_PER_PAGE = 8;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 text-[#D4AF37] animate-pulse font-medium text-sm tracking-widest uppercase">
                Chargement des données...
            </div>
        );
    }

    const { best_products, site_visits } = statsHistory;

    // --- Data Slicing for Pagination ---
    const allProducts = best_products || [];
    const totalProductPages = Math.ceil(allProducts.length / ITEMS_PER_PAGE);
    const displayedProducts = allProducts
        .slice(productsPage * ITEMS_PER_PAGE, (productsPage + 1) * ITEMS_PER_PAGE)
        .map((p, index) => ({
            name: p.name,
            value: p.sales,
            color: COLORS[index % COLORS.length]
        }));

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
            {/* 1. REVENUE / TRAFFIC (Smooth Area Chart) */}
            <motion.div variants={item} className="flex flex-col h-full bg-gray-50/50 dark:bg-white/[0.02] p-6 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-[#D4AF37]/30 transition-colors duration-500">
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Activité Réseau</h3>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Acquisition Utilisateurs</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37] animate-pulse"></div>
                </div>
                
                <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={site_visits}>
                            <defs>
                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                            <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(212,175,55,0.2)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Area type="monotone" dataKey="visits" name="Visites" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* 2. PRODUCT POPULARITY (Donut Chart) */}
            <motion.div variants={item} className="flex flex-col h-full bg-gray-50/50 dark:bg-white/[0.02] p-6 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-colors duration-500 relative">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Répartition Commandes</h3>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Produits les plus vendus</p>
                    </div>
                    <ChartPagination
                        currentPage={productsPage}
                        totalPages={totalProductPages}
                        onPageChange={setProductsPage}
                    />
                </div>

                <div className="flex-1 w-full relative min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={displayedProducts}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {displayedProducts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" style={{ filter: `drop-shadow(0px 4px 10px ${entry.color}40)` }} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Centered Total */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="text-3xl font-serif font-black text-gray-900 dark:text-white drop-shadow-sm">{displayedProducts.length}</span>
                        </div>
                    </div>
                </div>

                {/* Legend Snippet */}
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {displayedProducts.slice(0, 4).map((p, i) => (
                        <div key={i} className="flex items-center gap-2 group cursor-default">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                            <span className="text-[10px] font-medium text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors uppercase tracking-wider truncate max-w-[80px]">
                                {p.name}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DashboardCharts;
