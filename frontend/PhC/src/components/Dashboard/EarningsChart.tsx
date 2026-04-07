import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { CustomTooltip } from './DashboardCharts';

export default function EarningsChart() {
    const { statsHistory, loading } = useDashboardData();
    if (loading) return null;
    const { monthly_orders } = statsHistory;

    // Defaulting to monthly for simplicity or we can add the same toggle
    const displayedSales = monthly_orders || [];

    return (
        <div className="glass-panel p-6 group relative border border-white/5 hover:border-primary-500/30 transition-colors duration-500 rounded-3xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <div className="mb-6 relative z-10 flex justify-between items-end">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">Projection Financière</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Évolution des revenus (Net)</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(14,165,233,0.8)] animate-pulse"></span>
                    <span className="text-xs font-mono font-bold text-primary-500 dark:text-primary-400">SYNC_ACTIVE</span>
                </div>
            </div>
            <div className="h-[250px] w-full relative z-10 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayedSales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorEarningsObj" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dx={-10} tickFormatter={(value) => `${value}`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(150,150,150,0.1)', strokeWidth: 1 }} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Revenus"
                            stroke="#0ea5e9"
                            strokeWidth={3}
                            fill="url(#colorEarningsObj)"
                            activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#0f172a', strokeWidth: 2 }}
                            style={{ filter: 'drop-shadow(0px 10px 10px rgba(14, 165, 233, 0.2))' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
