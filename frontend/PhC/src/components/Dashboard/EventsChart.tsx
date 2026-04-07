import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { CustomTooltip } from './DashboardCharts';

const VISIBILITY_COLORS = ['#f59e0b', '#8b5cf6', '#10b981'];

export default function EventsChart() {
    const { statsHistory, loading } = useDashboardData();
    if (loading) return null;
    const { visibility_stats } = statsHistory;

    return (
        <div className="glass-panel p-6 flex flex-col group relative border border-white/5 hover:border-orange-500/30 transition-colors duration-500 rounded-3xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="mb-2 relative z-10">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">Impact Évènementiel</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Distribution par type d'audience</p>
            </div>

            <div className="flex-1 w-full flex items-center justify-center relative z-10 min-w-0 min-h-[250px]">
                <div className="w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <defs>
                                {visibility_stats?.map((_, index: number) => {
                                    const color = VISIBILITY_COLORS[index % VISIBILITY_COLORS.length];
                                    return (
                                        <linearGradient key={`gradVisExt-${index}`} id={`colorVisExt${index}`} x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                                            <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                                        </linearGradient>
                                    )
                                })}
                                <filter id="shadowExt">
                                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
                                </filter>
                            </defs>
                            <Pie
                                data={visibility_stats}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth={2}
                            >
                                {visibility_stats?.map((_, index: number) => (
                                    <Cell key={`cellExt-${index}`} fill={`url(#colorVisExt${index})`} className="hover:opacity-80 transition-opacity" style={{ filter: 'url(#shadowExt)' }} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="text-3xl font-display font-bold text-gray-900 dark:text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                {visibility_stats?.reduce((acc: number, curr: any) => acc + curr.value, 0)}
                            </span>
                            <p className="text-[10px] text-orange-500 dark:text-orange-400 font-medium tracking-widest uppercase mt-1">Total</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
