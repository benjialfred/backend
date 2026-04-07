import { useState, useEffect } from 'react';
import {
    Check,
    X
} from 'lucide-react';
import { appointmentAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface Appointment {
    id: string;
    client_name: string;
    date_requested: string;
    reason: string;
    status: 'PENDING' | 'VALIDATED' | 'CANCELLED';
}

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            const aptData: any = await appointmentAPI.getAll();
            setAppointments(Array.isArray(aptData) ? aptData : (aptData.results || []));
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error('Erreur lors du chargement des rendez-vous');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleUpdateStatus = async (id: string, status: 'VALIDATED' | 'CANCELLED') => {
        try {
            await appointmentAPI.updateStatus(id, status);
            toast.success(`Rendez-vous ${status === 'VALIDATED' ? 'validé' : 'annulé'}`);
            fetchAppointments();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Erreur lors de la mise à jour');
        }
    };

    if (loading) {
        return <div className="text-center py-4"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div></div>;
    }

    return (
        <div className="space-y-4">
            {appointments.length === 0 ? (
                <div className="text-center py-6 text-gray-400">Aucun rendez-vous</div>
            ) : (
                appointments.slice(0, 5).map(apt => (
                    <div key={apt.id} className="p-4 rounded-xl border border-primary-500/10 bg-dark-800/50 hover:bg-dark-800 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-bold text-white text-sm">{apt.client_name}</p>
                                <p className="text-xs text-primary-400 mt-1">
                                    {new Date(apt.date_requested).toLocaleString('fr-FR', {
                                        weekday: 'short', day: 'numeric', month: 'short',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${apt.status === 'VALIDATED' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                                apt.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                    'bg-orange-500/20 text-orange-400 border border-orange-500/20'
                                }`}>
                                {apt.status === 'VALIDATED' ? 'Confirmé' : apt.status === 'CANCELLED' ? 'Annulé' : 'En attente'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2 mt-2">{apt.reason}</p>

                        {apt.status === 'PENDING' && (
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleUpdateStatus(apt.id, 'VALIDATED')}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-bold transition-colors border border-green-500/20"
                                >
                                    <Check className="w-3 h-3" />
                                    Valider
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors border border-red-500/20"
                                >
                                    <X className="w-3 h-3" />
                                    Refuser
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default AdminAppointments;
