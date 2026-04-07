import {
    Users,
    ShoppingBag,
    Package,
    TrendingUp,
    Settings,
    Bell,
    Calendar
} from 'lucide-react';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Sidebar from '@/components/Dashboard/Sidebar';
import NotificationCenter from '@/components/communications/NotificationCenter';

interface AdminLayoutProps {
    children: React.ReactNode;
    className?: string; // Allow overriding background
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, className = "" }) => {
    // Nav items for Admin - These are now handled by Sidebar on desktop
    const navItems = [
        { label: "Vue d'ensemble", path: '/dashboard', icon: TrendingUp },
        { label: 'Commandes', path: '/dashboard/orders', icon: ShoppingBag },
        { label: 'Produits', path: '/dashboard/products', icon: Package },
        { label: 'Utilisateurs', path: '/dashboard/users', icon: Users },
        { label: 'Annonces', path: '/dashboard/announcements', icon: Bell },
        { label: 'Évènements', path: '/dashboard/events', icon: Calendar },
        { label: 'Paramètres', path: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className={`min-h-screen bg-[#FDFDFA] dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans flex relative overflow-hidden transition-colors duration-500 ${className}`}>
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <div className="hidden md:block fixed inset-y-0 left-0 z-50 w-72">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col md:pl-72 transition-all duration-300 relative z-10">
                {/* Mobile Navbar (Hidden on Desktop) */}
                <div className="md:hidden sticky top-0 z-40">
                    <DashboardNavbar
                        title="ProphAdmin"
                        subtitle="Panneau de Contrôle"
                        navItems={navItems}
                    />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 pt-6 md:pt-0 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                    {/* Desktop Top Bar */}
                    <div className="hidden md:flex justify-end items-center mb-8 gap-4 sticky top-4 z-40">
                        <div className="bg-white/80 dark:bg-dark-900/40 backdrop-blur-xl p-2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-glass">
                            <NotificationCenter />
                        </div>
                    </div>

                    <div className="relative z-10 space-y-8 animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
