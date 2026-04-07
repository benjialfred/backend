import { useState, useEffect } from 'react';
import { productAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Star, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProductReviewsProps {
    productId: number;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [commentText, setCommentText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const data = await productAPI.getComments(productId);
            setReviews(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Veuillez vous connecter pour laisser un avis.");
            return;
        }
        if (!commentText.trim()) {
            toast.error("Veuillez écrire un commentaire.");
            return;
        }

        try {
            setSubmitting(true);
            await productAPI.addComment(productId, {
                rating,
                comment_text: commentText,
                is_anonymous: isAnonymous
            });
            toast.success("Votre avis a été publié!");
            setCommentText('');
            fetchReviews();
        } catch (error) {
            toast.error("Erreur lors de l'ajout de l'avis.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Form */}
            {user ? (
                <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Laisser un avis</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Note (sur 5)</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <button 
                                        type="button" 
                                        key={i} 
                                        onClick={() => setRating(i)}
                                        className="focus:outline-none"
                                    >
                                        <Star className={`w-6 h-6 transition-colors ${i <= rating ? 'text-primary-500 fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={3}
                                className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none"
                                placeholder="Partagez votre expérience..."
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="anonymous"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="rounded text-primary-500 focus:ring-primary-500 bg-transparent border-gray-300 dark:border-white/20"
                            />
                            <label htmlFor="anonymous" className="text-sm">Publier anonymement</label>
                        </div>
                        <button type="submit" disabled={submitting} className="btn-premium px-6 py-2 text-sm">
                            {submitting ? 'Envoi...' : 'Publier'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                    <p className="text-gray-500">Connectez-vous pour laisser un avis.</p>
                </div>
            )}

            {/* List */}
            <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" /> Avis ({reviews.length})
                </h3>
                {loading ? (
                    <div className="animate-pulse space-y-4">
                         <div className="h-20 bg-gray-100 dark:bg-white/5 rounded-xl"></div>
                         <div className="h-20 bg-gray-100 dark:bg-white/5 rounded-xl"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <p className="text-gray-500">Aucun avis pour l'instant. Soyez le premier !</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-4 border border-gray-200 dark:border-white/10 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-gray-900 dark:text-white text-sm">
                                        {review.is_anonymous ? 'Utilisateur anonyme' : (review.user?.prenom || review.user?.nom || 'Client')}
                                    </div>
                                    <div className="flex text-primary-500">
                                        {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />)}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment_text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default ProductReviews;
