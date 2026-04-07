import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { contactAPI, type ContactMessageData } from '../../services/api';
import ConfirmationModal from '../ui/ConfirmationModal';
import { toast } from 'react-hot-toast';

interface ContactFormProps {
    variant?: 'light' | 'dark';
}

const ContactForm: React.FC<ContactFormProps> = ({ variant = 'light' }) => {
    const [formData, setFormData] = useState<ContactMessageData>({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await contactAPI.sendMessage(formData);
            setShowSuccessModal(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error("Failed to send message", error);
            toast.error("Une erreur est survenue lors de l'envoi du message.");
        } finally {
            setLoading(false);
        }
    };

    // Styles configuration based on variant
    const styles = {
        label: variant === 'dark' ? 'text-gray-300' : 'text-gray-700',
        input: variant === 'dark'
            ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-amber-500'
            : 'bg-white border-primary-500/50 dark:border-dark-700 text-dark-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-200',
        button: variant === 'dark'
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
            : 'bg-dark-900 text-white hover:bg-dark-800'
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${styles.label}`}>Nom complet</label>
                        <input
                            type="text"
                            required
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition-all outline-none ${styles.input}`}
                            placeholder="Votre nom"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${styles.label}`}>Email</label>
                        <input
                            type="email"
                            required
                            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition-all outline-none ${styles.input}`}
                            placeholder="votre@email.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-2 ${styles.label}`}>Sujet</label>
                    <input
                        type="text"
                        required
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition-all outline-none ${styles.input}`}
                        placeholder="Sujet de votre message"
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    />
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-2 ${styles.label}`}>Message</label>
                    <textarea
                        required
                        rows={6}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition-all outline-none resize-none ${styles.input}`}
                        placeholder="Comment pouvons-nous vous aider ?"
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full sm:w-auto px-8 py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${styles.button}`}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
                        Envoyer le message
                    </button>
                </div>
            </form>

            <ConfirmationModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                onConfirm={() => setShowSuccessModal(false)}
                title="Message Envoyé !"
                message="Merci de nous avoir contactés. Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais."
                type="success"
                confirmLabel="Fermer"
                cancelLabel="Fermer"
            />
        </>
    );
};

export default ContactForm;
