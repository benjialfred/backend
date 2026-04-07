import { useState, useEffect } from 'react';
import { productAPI } from '@/services/api';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientComments = () => {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
             try {
                 const data = await productAPI.getMyComments();
                 setComments(Array.isArray(data) ? data : data.results || []);
             } catch (error) {
                 console.error(error);
             } finally {
                 setLoading(false);
             }
        };
        fetchComments();
    }, []);

    if (loading) return <div className="p-8 text-center animate-pulse">Chargement de vos avis...</div>;

    if (comments.length === 0) {
        return (
            <div className="glass-panel rounded-2xl p-8 text-center">
                <h3 className="text-xl font-serif font-bold dark:text-white mb-2">Aucun avis</h3>
                <p className="text-gray-500 mb-6">Vous n'avez pas encore commenté nos produits.</p>
                <Link to="/products" className="btn-premium px-6 py-2">Parcourir la boutique</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Mes Avis</h2>
            <div className="grid gap-4">
                {comments.map((comment: any) => (
                    <div key={comment.id} className="glass-panel p-6 rounded-xl flex gap-4 flex-col sm:flex-row shadow-sm">
                        {comment.product && comment.product.image_principale && (
                            <img src={comment.product.image_principale} alt={comment.product.nom} className="w-20 h-20 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">{comment.product?.nom}</h4>
                            <div className="flex text-primary-500 mb-2">
                                {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= comment.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />)}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">"{comment.comment_text}"</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ClientComments;
