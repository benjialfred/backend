import React from 'react';
import { Bell, Search } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import CreateAnnouncementForm from '@/components/communications/CreateAnnouncementForm';
import AnnouncementList from '@/components/communications/AnnouncementList';

const Announcements = () => {
    const [refresh, setRefresh] = React.useState(0);
    const [searchTerm, setSearchTerm] = React.useState('');

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Gestion des Annonces</h1>
                        <p className="text-gray-400">Publiez et gérez les annonces pour vos équipes</p>
                    </div>
                    {/* Search Bar - Optional enhancement */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-600 dark:text-primary-300" />
                        <input
                            type="text"
                            placeholder="Rechercher une annonce..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500 placeholder-gray-600 w-64"
                        />
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Create Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg sticky top-24 backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                <div className="p-2 bg-primary-500/10 rounded-lg border border-primary-500/20">
                                    <Bell className="w-5 h-5 text-primary-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white">Nouvelle Annonce</h2>
                            </div>
                            <CreateAnnouncementForm onSuccess={() => setRefresh(prev => prev + 1)} />
                        </div>
                    </div>

                    {/* Right Column: List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 rounded-xl border border-white/10 shadow-lg overflow-hidden backdrop-blur-md">
                            <div className="p-6 border-b border-white/10 bg-black/40">
                                <h2 className="text-lg font-bold text-white">Historique des Annonces</h2>
                            </div>
                            <div className="p-6">
                                <AnnouncementList key={refresh} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Announcements;
