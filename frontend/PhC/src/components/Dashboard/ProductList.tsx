// src/components/dashboard/ProductList.tsx
import { useEffect, useState } from 'react';
import { Star, Eye, ShoppingBag, Trash2, Tag, ChevronRight } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { toast } from 'react-hot-toast';
import { productAPI } from '@/services/api';
import type { Product } from '@/types';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      const data = response.results || response;
      // @ts-ignore
      setProducts(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productAPI.delete(deleteId);
      setProducts(products.filter(p => p.id !== deleteId));
      toast.success('Produit supprimé avec succès', {
        style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete product", error);
      toast.error("Erreur lors de la suppression", {
        style: { background: '#ef4444', color: '#fff' }
      });
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-6 animate-pulse">
        <div className="h-6 w-48 bg-white/5 rounded mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-white/5 rounded-xl block"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-white/5 rounded"></div>
                  <div className="h-3 w-24 bg-white/5 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-16 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-panel flex flex-col h-full overflow-hidden border border-white/5 relative group">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

        <div className="p-6 border-b border-white/5 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-display text-white tracking-wide glow-text">Produits populaires</h3>
              <p className="text-gray-400 text-[11px] uppercase tracking-widest mt-1">Vos meilleurs articles</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/products')}
              className="text-accent-400 hover:text-accent-300 text-sm font-medium transition-colors flex items-center gap-1 group/btn"
            >
              Voir le catalogue <ChevronRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-white/5 flex-1 relative z-10">
          {products.map((product) => (
            <div key={product.id} className="p-5 hover:bg-white/5 transition-colors duration-300 group/item relative overflow-hidden">
              {/* Item hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent-500/0 via-accent-500/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4 flex-1">

                  {/* Product Image Placeholder or actual Image (Mocking with Icon for now) */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dark-800 to-dark-900 border border-white/10 flex items-center justify-center shrink-0 group-hover/item:border-accent-500/30 group-hover/item:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all overflow-hidden relative">
                    {product.image_principale ? (
                      <img src={product.image_principale} alt={product.nom} className="w-full h-full object-cover" />
                    ) : (
                      <Tag className="w-5 h-5 text-dark-600 dark:text-primary-300 group-hover/item:text-accent-400 transition-colors relative z-10" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-bold text-sm text-white group-hover/item:text-accent-100 transition-colors drop-shadow-sm">{product.nom}</h4>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Price Tag */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold text-accent-300 bg-accent-500/10 border border-accent-500/20 shadow-sm border-white/5 mt-0.5">
                        {product.prix?.toLocaleString()} FCFA
                      </span>

                      <div className="flex items-center gap-1.5 bg-dark-950/50 px-2 py-0.5 rounded border border-white/5 mt-0.5">
                        <Star className="w-3 h-3 text-orange-400 fill-orange-500/50" />
                        <span className="text-[10px] font-medium text-gray-300">4.8</span>
                      </div>

                      <div className={`flex items-center gap-1.5 px-2 py-0.5 mt-0.5 rounded border ${product.stock && product.stock > 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <ShoppingBag className="w-3 h-3" />
                        <span className="text-[10px] font-bold">{product.stock || 0} left</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 ml-4 opacity-0 group-hover/item:opacity-100 transform translate-x-2 group-hover/item:translate-x-0 transition-all duration-300 item-actions shrink-0">
                  <button
                    onClick={() => navigate(`/dashboard/products/${product.id}`)}
                    className="p-2 text-primary-400 hover:text-white hover:bg-primary-500/20 rounded-lg transition-all border border-transparent hover:border-primary-500/30 hover:shadow-[0_0_10px_rgba(14,165,233,0.3)] bg-dark-950/50"
                    title="Voir détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(product.id); }}
                    className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-all border border-transparent hover:border-red-500/30 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] bg-dark-950/50"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
              <Tag className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium font-display">Aucun produit listé</p>
              <p className="text-xs text-dark-600 dark:text-primary-300 mt-1">Ajoutez des produits au catalogue.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible et retirera le produit du catalogue."
        type="danger"
        confirmLabel="Supprimer définitivement"
        cancelLabel="Annuler"
      />
    </>
  );
};

export default ProductList;