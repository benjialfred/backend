import { useState, useEffect } from 'react';
import { dashboardAPI } from '@/services/api';
import type { DashboardStats } from '@/types';

export const useDashboardData = () => {
    const [stats, setStats] = useState<DashboardStats>({
        total_users: 0,
        total_products: 0,
        total_orders: 0,
        total_revenue: 0,
        pending_orders: 0,
        active_apprentices: 0,
        total_withdrawn: 0,
        available_balance: 0
    });
    const [loading, setLoading] = useState(true);
    const [statsHistory, setStatsHistory] = useState<{
        monthly_orders: any[];
        yearly_orders: any[];
        best_products: any[];
        site_visits: any[]; // Mock
        events_stats: any[]; // Mock
        visibility_stats: any[]; // Mock
    }>({
        monthly_orders: [],
        yearly_orders: [],
        best_products: [],
        site_visits: [],
        events_stats: [],
        visibility_stats: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const statsData = await dashboardAPI.getStats();

            let financeStats = { total_revenue: 0, total_withdrawn: 0, available_balance: 0 };
            try {
                if (dashboardAPI.getFinanceStats) {
                    const response = await dashboardAPI.getFinanceStats();
                    if (response) financeStats = response;
                }
            } catch (e) {
                console.error("Could not fetch finance stats", e);
            }

            const mergedStats = { ...statsData, ...financeStats };

            // Mock Data Generation for missing endpoints
            // Mock Visits (Keep as mock for now unless we add a tracking model)
            const mockVisits = [
                { name: 'Lun', visits: 120, unique: 80 },
                { name: 'Mar', visits: 150, unique: 90 },
                { name: 'Mer', visits: 180, unique: 110 },
                { name: 'Jeu', visits: 140, unique: 85 },
                { name: 'Ven', visits: 200, unique: 130 },
                { name: 'Sam', visits: 250, unique: 160 },
                { name: 'Dim', visits: 220, unique: 140 },
            ];

            // Use Real Events Data if available, else fallback
            const realEvents = statsData.events_distribution && statsData.events_distribution.length > 0
                ? statsData.events_distribution
                : [
                    { name: 'Défilé', value: 0 },
                    { name: 'Don', value: 0 },
                    { name: 'Partenariat', value: 0 }
                ];

            setStats(mergedStats);
            setStatsHistory({
                ...mergedStats,
                best_products: statsData.best_products || [],
                monthly_orders: statsData.monthly_orders || [],
                yearly_orders: statsData.yearly_orders || [],
                site_visits: mockVisits, // Still mock
                events_stats: [], // Deprecated/Unused list
                visibility_stats: realEvents // Now mapped to Real Events Distribution
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return { stats, statsHistory, loading, refresh: fetchDashboardData };
};
