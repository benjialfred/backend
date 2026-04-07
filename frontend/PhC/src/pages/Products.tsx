import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Download,
    Upload,
    Grid,
    List,
    Package,
    Tag,
    Star,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Leaf
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Modal from '@/components/ui/Modal';
import AddProductForm from '@/components/forms/AddProductForm';
import { productAPI } from '@/services/api';
import type { Product } from '@/types';

const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<{ id: string | number; nom: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const PAGE_SIZE = 12;

    useEffect(() => {
        fetchData();
    }, [currentPage, selectedCategory]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 1) {
                fetchProducts();
            } else {
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const params: any = {
                page: currentPage,
                page_size: PAGE_SIZE
            };

            if (searchTerm) params.search = searchTerm;
            if (selectedCategory !== 'all') params.category_id = selectedCategory;

            const [productsResponse, categoriesResponse] = await Promise.all([
                productAPI.getAll(params),
                categories.length === 0 ? productAPI.getCategories() : Promise.resolve(categories)
            ]);

            // Handle Products
            const productsData: any = productsResponse;
            let productsList = [];

            if (Array.isArray(productsData)) {
                productsList = productsData;
                setTotalCount(productsData.length);
                setTotalPages(Math.ceil(productsData.length / PAGE_SIZE));
            } else {
                productsList = productsData.results || [];
                setTotalCount(productsData.count || 0);
                setTotalPages(Math.ceil((productsData.count || 0) / PAGE_SIZE));
            }
            setProducts(productsList);

            // Handle Categories
            if (categories.length === 0) {
                let categoriesList = [];
                if (Array.isArray(categoriesResponse)) {
                    categoriesList = categoriesResponse;
                } else if (categoriesResponse && typeof categoriesResponse === 'object' && Array.isArray((categoriesResponse as any).results)) {
                    categoriesList = (categoriesResponse as any).results;
                }
                setCategories(categoriesList);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = () => fetchData();

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            try {
                await productAPI.delete(id);
                setProducts(products.filter(p => p.id !== id));
                toast.success('Produit supprimé avec succès');
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    const handleToggleStatus = (id: number) => {
        setProducts(products.map(product =>
            product.id === id
                ? { ...product, is_active: !product.is_active }
                : product
        ));
        toast.success(`Produit ${products.find(p => p.id === id)?.is_active ? 'désactivé' : 'activé'}`);
    };

    const handleToggleFeatured = (id: number) => {
        setProducts(products.map(product =>
            product.id === id
                ? { ...product, is_featured: !product.is_featured }
                : product
        ));
        toast.success(`Produit ${products.find(p => p.id === id)?.is_featured ? 'retiré des' : 'ajouté aux'} vedettes`);
    };

    const getCategoryName = (categoryId: number) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.nom : 'Non catégorisé';
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { 
            color: 'status-badge-danger', 
            text: 'Rupture', 
            dot: 'bg-red-500',
            progress: 0 
        };
        if (stock <= 5) return { 
            color: 'status-badge-warning', 
            text: 'Faible', 
            dot: 'bg-orange-500',
            progress: 20 
        };
        if (stock <= 20) return { 
            color: 'status-badge-info', 
            text: 'Moyen', 
            dot: 'bg-primary-500',
            progress: 60 
        };
        return { 
            color: 'status-badge-success', 
            text: 'Bon', 
            dot: 'bg-green-500',
            progress: 100 
        };
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-white p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Leaf className="w-6 h-6 text-primary-600" />
                                <h1 className="text-3xl font-serif font-bold text-black">Catalogue Produits</h1>
                            </div>
                            <p className="text-black/60">
                                Gérez votre collection • <span className="font-medium text-primary-600">{totalCount} produits</span>
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button className="btn-outline flex items-center gap-2 py-2.5">
                                <Upload className="w-4 h-4" />
                                <span>Importer</span>
                            </button>
                            <button className="btn-outline flex items-center gap-2 py-2.5">
                                <Download className="w-4 h-4" />
                                <span>Exporter</span>
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn-premium-primary flex items-center gap-2 py-2.5"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Nouveau produit</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-clean w-full pl-10"
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="select-clean min-w-[180px]"
                            >
                                <option value="all">Toutes les catégories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                                ))}
                            </select>
                            
                            <button className="btn-outline flex items-center gap-2 py-2.5">
                                <Filter className="w-4 h-4" />
                                <span>Filtres</span>
                            </button>
                            
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2.5 transition-colors ${
                                        viewMode === 'grid' 
                                            ? 'bg-primary-500 text-black' 
                                            : 'text-black/60 hover:bg-gray-100'
                                    }`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2.5 transition-colors ${
                                        viewMode === 'list' 
                                            ? 'bg-primary-500 text-black' 
                                            : 'text-black/60 hover:bg-gray-100'
                                    }`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-black/60 mb-1">Total produits</p>
                                <p className="text-2xl font-serif font-bold text-black">{products.length}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                                <Package className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-black/60 mb-1">En vedette</p>
                                <p className="text-2xl font-serif font-bold text-black">
                                    {products.filter(p => p.is_featured).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                                <Star className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-black/60 mb-1">En promotion</p>
                                <p className="text-2xl font-serif font-bold text-black">
                                    {products.filter(p => p.prix_promotion).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                                <Tag className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-black/60 mb-1">Stock total</p>
                                <p className="text-2xl font-serif font-bold text-black">
                                    {products.reduce((acc, p) => acc + p.stock, 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid/List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-black/60">Chargement des produits...</p>
                    </div>
                ) : (
                    <>
                        {/* Results count */}
                        <div className="mb-4">
                            <p className="text-sm text-black/60">
                                Affichage de <span className="font-medium text-black">
                                    {((currentPage - 1) * PAGE_SIZE) + 1} - {Math.min(currentPage * PAGE_SIZE, totalCount)}
                                </span> sur <span className="font-medium text-black">{totalCount}</span> produits
                            </p>
                        </div>

                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map(product => (
                                    <div key={product.id} className="card-hover group">
                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={product.image_principale}
                                                alt={product.nom}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            
                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                {product.is_featured && (
                                                    <span className="status-badge bg-amber-500 text-white border-amber-500">
                                                        <Star className="w-3 h-3 mr-1" />
                                                        Vedette
                                                    </span>
                                                )}
                                                {product.prix_promotion && (
                                                    <span className="status-badge bg-primary-500 text-black font-bold border-primary-500">
                                                        -{Math.round((1 - product.prix_promotion / product.prix) * 100)}%
                                                    </span>
                                                )}
                                                {!product.is_active && (
                                                    <span className="status-badge bg-gray-600 text-white border-gray-600">
                                                        Inactif
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-serif font-bold text-black group-hover:text-primary-600 transition-colors">
                                                    {product.nom}
                                                </h3>
                                                <div className="text-right">
                                                    {product.prix_promotion ? (
                                                        <>
                                                            <span className="text-primary-600 font-bold block">
                                                                {product.prix_promotion.toLocaleString()} FCFA
                                                            </span>
                                                            <span className="text-xs text-black/40 line-through">
                                                                {product.prix.toLocaleString()} FCFA
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="font-bold text-black">
                                                            {product.prix.toLocaleString()} FCFA
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-sm text-black/60 mb-3 line-clamp-2">
                                                {product.description}
                                            </p>

                                            <div className="flex items-center justify-between mb-3">
                                                <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded-md text-xs font-medium">
                                                    {getCategoryName(product.category_id)}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <span className={`w-2 h-2 rounded-full ${getStockStatus(product.stock).dot}`} />
                                                    <span className="text-xs text-black/60">
                                                        Stock: {product.stock}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mt-4">
                                                <button
                                                    onClick={() => handleToggleFeatured(product.id)}
                                                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                        product.is_featured
                                                            ? 'bg-amber-500 text-white'
                                                            : 'border border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <Star className="w-4 h-4" />
                                                    <span>Vedette</span>
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleToggleStatus(product.id)}
                                                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                        product.is_active
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-gray-500 text-white'
                                                    }`}
                                                >
                                                    {product.is_active ? (
                                                        <CheckCircle className="w-4 h-4" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4" />
                                                    )}
                                                    <span>{product.is_active ? 'Actif' : 'Inactif'}</span>
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                                <button
                                                    onClick={() => setSelectedProduct(product)}
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    <span>Modifier</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Supprimer</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-black/60 uppercase tracking-wider">Produit</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-black/60 uppercase tracking-wider">Catégorie</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-black/60 uppercase tracking-wider">Prix</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-black/60 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-black/60 uppercase tracking-wider">Statut</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-black/60 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map(product => {
                                            const stockStatus = getStockStatus(product.stock);
                                            return (
                                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={product.image_principale}
                                                                alt={product.nom}
                                                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                                            />
                                                            <div>
                                                                <div className="font-serif font-bold text-black flex items-center gap-2">
                                                                    {product.nom}
                                                                    {product.is_featured && (
                                                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-black/40">
                                                                    {product.taille} • {product.couleur}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-medium">
                                                            {getCategoryName(product.category_id)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {product.prix_promotion ? (
                                                            <div>
                                                                <span className="font-bold text-primary-600">
                                                                    {product.prix_promotion.toLocaleString()} FCFA
                                                                </span>
                                                                <span className="text-xs text-black/40 line-through block">
                                                                    {product.prix.toLocaleString()} FCFA
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="font-bold text-black">
                                                                {product.prix.toLocaleString()} FCFA
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full ${stockStatus.dot}`}
                                                                    style={{ width: `${stockStatus.progress}%` }}
                                                                />
                                                            </div>
                                                            <span className={`text-sm ${stockStatus.color.split(' ')[1]}`}>
                                                                {product.stock}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={stockStatus.color}>
                                                            {stockStatus.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleToggleFeatured(product.id)}
                                                                className={`p-2 rounded-lg transition-colors ${
                                                                    product.is_featured
                                                                        ? 'text-amber-600 hover:bg-amber-50'
                                                                        : 'text-black/40 hover:text-black hover:bg-gray-100'
                                                                }`}
                                                                title={product.is_featured ? 'Retirer des vedettes' : 'Mettre en vedette'}
                                                            >
                                                                <Star className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedProduct(product)}
                                                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                                title="Modifier"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(product.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-8">
                                <div className="text-sm text-black/40">
                                    Page {currentPage} sur {totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-black/60 hover:border-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5 && currentPage > 3) {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        if (pageNum > totalPages) return null;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`min-w-[40px] h-10 rounded-lg transition-colors font-bold ${
                                                    currentPage === pageNum
                                                        ? 'bg-primary-500 text-black'
                                                        : 'border border-gray-200 text-black/60 hover:border-primary-500 hover:text-primary-600'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-black/60 hover:border-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={showAddModal || !!selectedProduct}
                onClose={() => {
                    setShowAddModal(false);
                    setSelectedProduct(null);
                }}
                title={selectedProduct ? 'Modifier le produit' : 'Nouveau produit'}
                size="xl"
            >
                <AddProductForm
                    product={selectedProduct}
                    onSuccess={() => {
                        setShowAddModal(false);
                        setSelectedProduct(null);
                        fetchProducts();
                        toast.success(selectedProduct ? 'Produit modifié avec succès' : 'Produit créé avec succès');
                    }}
                />
            </Modal>
        </AdminLayout>
    );
};

export default Products;