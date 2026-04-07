import React, { useState } from 'react';
import { X, DollarSign, Loader } from 'lucide-react';
import { withdrawalAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableBalance: number;
    onSuccess: () => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
    isOpen,
    onClose,
    availableBalance,
    onSuccess
}) => {
    const [amount, setAmount] = useState<string>('');
    const [details, setDetails] = useState<string>('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Veuillez entrer un montant valide.");
            return;
        }

        if (numAmount > availableBalance) {
            toast.error("Le montant dépasse le solde disponible.");
            return;
        }

        try {
            setLoading(true);
            await withdrawalAPI.create({
                amount: numAmount,
                details: details.trim() || "Retrait Admin"
            });
            toast.success("Demande de retrait créée avec succès.");
            onSuccess();
            onClose();
            setAmount('');
            setDetails('');
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la création du retrait.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md">
            <div className="glass-panel w-full max-w-md rounded-2xl shadow-glass overflow-hidden animate-in fade-in zoom-in duration-200 relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
                <div className="flex justify-between items-center p-6 border-b border-white/5 relative z-10">
                    <h2 className="text-xl font-bold font-display flex items-center gap-2 text-white">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        Faire un retrait
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 relative z-10">
                    <div className="p-4 bg-dark-900/50 rounded-xl mb-6 border border-white/5">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Solde Disponible</p>
                        <p className="text-3xl font-bold font-display text-white">
                            {availableBalance.toLocaleString()} FCFA
                        </p>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-2">
                            Montant à retirer (FCFA) *
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={availableBalance}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-950 text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            placeholder="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-2">
                            Motif ou détails (Optionnel)
                        </label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-950 text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                            placeholder="Ex: Retrait mensuel..."
                            rows={3}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
                            className="flex-1 px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader className="w-4 h-4 animate-spin" />}
                            Confirmer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WithdrawalModal;
