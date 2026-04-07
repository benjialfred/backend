import { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { motion } from 'framer-motion';
import type { WorkerProject, DailyJournal } from '@/types';

interface ApprenticeChartsProps {
    projects: WorkerProject[];
    journals: DailyJournal[];
}

const ApprenticeCharts = ({ projects, journals }: ApprenticeChartsProps) => {
    // Process Project Data
    const projectData = useMemo(() => {
        const counts = {
            'En Cours': projects.filter(p => p.status === 'IN_PROGRESS').length,
            'Terminé': projects.filter(p => p.status === 'COMPLETED').length,
            'En Attente': projects.filter(p => p.status === 'PLANNED').length
        };

        return [
            { name: 'En Cours', value: counts['En Cours'], color: '#0ea5e9' }, // primary-500
            { name: 'Terminé', value: counts['Terminé'], color: '#22c55e' }, // green-500
            { name: 'En Attente', value: counts['En Attente'], color: '#6b7280' } // gray-500
        ].filter(d => d.value > 0);
    }, [projects]);

    // Process Journal Activity (Last 7 Days)
    const activityData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return {
                date: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
                fullDate: d.toISOString().split('T')[0],
                count: 0
            };
        }).reverse();

        journals.forEach(journal => {
            const journalDate = journal.date.split('T')[0];
            const dayData = last7Days.find(d => d.fullDate === journalDate);
            if (dayData) {
                dayData.count += 1;
            }
        });

        return last7Days;
    }, [journals]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Project Progress */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-panel rounded-3xl p-6 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[40px] pointer-events-none" />

                <h3 className="text-lg font-bold font-display text-white mb-6 flex items-center gap-2 relative z-10">
                    <span className="w-2 h-6 bg-primary-500 rounded-full glow-primary"></span>
                    Progression des Projets
                </h3>
                <div className="h-[300px] w-full relative z-10">
                    {projectData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={projectData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {projectData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        boxShadow: '0 4px 20px -1px rgba(0, 0, 0, 0.5)',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ color: '#9ca3af' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-dark-600 dark:text-primary-300 font-medium">
                            <p>Aucun projet assigné</p>
                        </div>
                    )}
                    {/* Center Stat */}
                    {projectData.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-10">
                            <div className="text-center">
                                <span className="text-4xl font-bold font-display text-white drop-shadow-md">{projects.length}</span>
                                <p className="text-xs text-primary-400 uppercase tracking-widest font-bold mt-1">Projets</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Journal Activity */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-panel rounded-3xl p-6 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full blur-[40px] pointer-events-none" />

                <h3 className="text-lg font-bold font-display text-white mb-6 flex items-center gap-2 relative z-10">
                    <span className="w-2 h-6 bg-accent-500 rounded-full glow-accent"></span>
                    Activité Récente
                </h3>
                <div className="h-[300px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 4px 20px -1px rgba(0, 0, 0, 0.5)',
                                    color: '#fff'
                                }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#1f2937' }}
                                activeDot={{ r: 6, fill: '#fff', strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default ApprenticeCharts;
