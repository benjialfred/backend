import { useState, useEffect } from 'react';
import {
    Plus, DollarSign, Calendar, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { withdrawalAPI } from '@/services/api';
import type { Withdrawal } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function WithdrawalsView() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processed' | 'rejected'>('all');

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const data = await withdrawalAPI.getAll();
            setWithdrawals(data.results || []);
        } catch (error) {
            console.error(error);
            toast.error("Impossible de charger l'historique des retraits");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !details) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        try {
            setSubmitting(true);
            await withdrawalAPI.create({
                amount: parseFloat(amount),
                details
            });
            toast.success('Demande de retrait envoyée avec succès');
            setShowRequestModal(false);
            setAmount('');
            setDetails('');
            fetchWithdrawals();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la demande de retrait");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredWithdrawals = withdrawals.filter(w =>
        statusFilter === 'all' ? true : w.status === statusFilter.toUpperCase()
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
            case 'REJECTED': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b]/60 backdrop-blur-md p-6 rounded-2xl border border-white/5">
                <div>
                    <h2 className="text-xl font-bold text-white mb-2">Historique des Retraits</h2>
                    <p className="text-gray-400">Gérez vos demandes de retrait de fonds</p>
                </div>
                <button
                    onClick={() => setShowRequestModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Nouveau Retrait
                </button>
            </div>

            <div className="bg-[#1e293b]/60 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-white/5 flex gap-2 overflow-x-auto">
                    {(['all', 'pending', 'processed', 'rejected'] as const).map(filter => (
                        <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === filter
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {filter === 'all' ? 'Tout' : filter === 'pending' ? 'En attente' : filter === 'processed' ? 'Traités' : 'Rejetés'}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-4 text-sm font-semibold text-gray-300">Date</th>
                                <th className="p-4 text-sm font-semibold text-gray-300">Montant</th>
                                <th className="p-4 text-sm font-semibold text-gray-300">Statut</th>
                                <th className="p-4 text-sm font-semibold text-gray-300 hidden md:table-cell">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-400">Chargement...</td>
                                </tr>
                            ) : filteredWithdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-400">Aucun retrait trouvé</td>
                                </tr>
                            ) : (
                                filteredWithdrawals.map((withdrawal) => (
                                    <tr key={withdrawal.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-dark-600 dark:text-primary-300" />
                                                {format(new Date(withdrawal.created_at), 'dd MMM yyyy', { locale: fr })}
                                            </div>
                                            <div className="text-xs text-dark-600 dark:text-primary-300 pl-6">
                                                {format(new Date(withdrawal.created_at), 'HH:mm')}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-white">
                                            {withdrawal.amount.toLocaleString()} FCFA
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(withdrawal.status)}`}>
                                                {getStatusIcon(withdrawal.status)}
                                                <span className="capitalize">
                                                    {withdrawal.status === 'PENDING' ? 'En attente' : withdrawal.status === 'APPROVED' ? 'Traité' : 'Rejeté'}
                                                </span>
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm hidden md:table-cell max-w-xs truncate">
                                            {withdrawal.details}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Request */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[#1e293b] rounded-2xl border border-white/10 w-full max-w-md p-6 shadow-xl transform transition-all">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <DollarSign className="w-6 h-6 text-blue-500" />
                            Demande de Retrait
                        </h3>

                        <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Montant à retirer (FCFA)</label>
                                <input
                                    type="number"
                                    min="1000"
                                    step="500"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Ex: 50000"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Détails de paiement</label>
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none h-24 resize-none"
                                    placeholder="Ex: Orange Money 690XXXXXX ou Compte Bancaire..."
                                    required
                                />
                                <p className="text-xs text-dark-600 dark:text-primary-300 mt-1">Précisez le moyen de paiement et le numéro/compte.</p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowRequestModal(false)}
                                    className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Confirmer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
