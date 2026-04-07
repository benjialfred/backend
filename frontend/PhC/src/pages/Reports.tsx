import Header from '@/components/layout/Header';
import Sidebar from '@/components/Dashboard/Sidebar';
import ReportsView from '@/components/Dashboard/admin/ReportsView';


const Reports = () => {
    return (
        <div className="min-h-screen bg-white">
            <Sidebar />
            <div className="md:ml-72 transition-all duration-300">
                <Header title="Rapports et Statistiques" />
                <main className="p-6">
                    <ReportsView />
                </main>
            </div>
        </div>
    );
};

export default Reports;
