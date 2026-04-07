import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

import Navigation from '@/components/Navigation';
import Footer from '@/components/layout/Footer';
import Productcard from './Productcard';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { productAPI } from '@/services/api';

const ProductsPublic = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  const setSearchTerm = (term: string) => {
    if (term) {
      setSearchParams(prev => {
        prev.set('search', term);
        return prev;
      });
    } else {
      setSearchParams(prev => {
        prev.delete('search');
        return prev;
      });
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 250000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showPromotions, setShowPromotions] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);

  const itemsPerPage = 12;

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([
    { id: 'all', name: 'Toutes les catégories' }
  ]);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'UNIQUE'];

  useEffect(() => {
    // FONCITON PERMETTANT L'AFFICHAGE DES PRODUITS 
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productAPI.getAll(),
          productAPI.getCategories()
        ]);

        const pList = Array.isArray(productsData) ? productsData : (productsData as any).results || [];
        setProducts(pList);

        const catList = Array.isArray(categoriesData) ? categoriesData : (categoriesData as any).results || [];

        const mappedCategories = catList.map((c: any) => ({
          id: c.id.toString(),
          name: c.nom
        }));

        setCategories([{ id: 'all', name: 'Toutes les catégories' }, ...mappedCategories]);
      } catch (error) {
        console.error('Error loading public products:', error);
        toast.error('Impossible de charger le catalogue');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = (product.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const categoryId = typeof product.category === 'object' && product.category !== null ? product.category.id : product.category;
      const matchesCategory = selectedCategory === 'all' ||
        (categoryId !== undefined && categoryId !== null && categoryId.toString() === selectedCategory);
      const matchesPrice = product.prix >= priceRange[0] && product.prix <= priceRange[1];
      const matchesSize = selectedSizes.length === 0 || (product.taille && selectedSizes.includes(product.taille));
      const matchesColor = selectedColors.length === 0 || (product.couleur && selectedColors.some(color =>
        product.couleur?.toLowerCase().includes(color.toLowerCase())
      ));
      const matchesPromotions = !showPromotions || product.prix_promotion !== null;
      const matchesFeatured = !showFeatured || product.is_featured;

      return matchesSearch && matchesCategory && matchesPrice &&
        matchesSize && matchesColor && matchesPromotions && matchesFeatured;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.prix - b.prix;
        case 'price-high':
          return b.prix - a.prix;
        case 'newest':
          return b.id - a.id;
        default: // featured / popular
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      }
    });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange, sortBy, selectedSizes, selectedColors, showPromotions, showFeatured]);

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const nextPage = () => paginate(Math.min(currentPage + 1, totalPages));
  const prevPage = () => paginate(Math.max(currentPage - 1, 1));

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 250000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setShowPromotions(false);
    setShowFeatured(false);
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans transition-colors duration-300 relative overflow-hidden flex flex-col">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap');`}
      </style>

      <div className="relative z-10 w-full hover-bg-transparent">
        <Navigation />
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-10 py-12 md:py-20 relative z-0">
        {/* Breadcrumbs & Hero Title */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-base font-medium uppercase tracking-widest text-black/60 dark:text-primary-100 mb-4">
            <a className="hover:text-primary-500 transition-colors" href="/">Boutique</a>
            <span className="text-sm md:text-base font-medium">&gt;</span>
            <span className="text-primary-500 font-bold">Collections</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-2 italic font-serif">Notre boutique</h2>
              <p className="text-black/60 dark:text-primary-200 max-w-xl">Consulter notre boutique et trouvez y votre compte avec nos modèles de qualités particulières.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base font-medium font-semibold uppercase tracking-tighter text-black/60 dark:text-primary-200">Trier par:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-black border border-primary-500/10 rounded-lg px-4 py-2 text-base font-medium focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="featured">popularités</option>
                <option value="newest">Nouveautés</option>
                <option value="price-low">Prix en hausse</option>
                <option value="price-high">Prix en baisse</option>
              </select>
            </div>
          </div>

          {/* Search and Mobile Filter Toggle */}
          <div className="mt-6 flex gap-4 md:hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/60 dark:text-primary-200 w-4 h-4" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-black border border-primary-500/10 rounded-lg text-base font-medium outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="p-2 border border-primary-500/20 rounded-lg bg-white dark:bg-black text-black dark:text-white flex items-center justify-center"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className={`w-full lg:w-64 flex-shrink-0 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-28 space-y-8 bg-white dark:bg-black lg:bg-transparent lg:dark:bg-transparent p-6 lg:p-0 rounded-xl border border-primary-500/10 lg:border-none shadow-sm lg:shadow-none z-20">
              {/* Categories */}
              <div>
                <div className="flex justify-between items-center border-b border-primary-500/20 pb-2 mb-4">
                  <h3 className="text-base font-medium font-bold uppercase tracking-widest text-black dark:text-white">Categories</h3>
                  {selectedCategory !== 'all' && (
                    <button onClick={() => setSelectedCategory('all')} className="text-sm md:text-base font-medium text-black/60 dark:text-primary-200 hover:text-primary-500 uppercase tracking-widest">Clear</button>
                  )}
                </div>
                <ul className="space-y-3 text-base font-medium">
                  {categories.map(cat => {
                    const count = products.filter(p => {
                      const catId = typeof p.category === 'object' && p.category !== null ? p.category.id : p.category;
                      return cat.id === 'all' || (catId !== undefined && catId !== null && catId.toString() === cat.id);
                    }).length;

                    return (
                      <li
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center justify-between group cursor-pointer ${selectedCategory === cat.id ? 'text-primary-500 font-bold' : 'text-black/60 dark:text-primary-200'}`}
                      >
                        <span className="group-hover:text-primary-500 transition-colors">{cat.name}</span>
                        <span className="text-sm md:text-base font-medium opacity-70">({count})</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-base font-medium font-bold uppercase tracking-widest border-b border-primary-500/20 pb-2 mb-4 text-black dark:text-white">Price Range</h3>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="number"
                    placeholder="Max FCFA"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value) || 250000])}
                    className="w-full text-base font-medium bg-white dark:bg-black border border-primary-500/10 rounded p-2 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="250000"
                  step="5000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full h-1 bg-primary-500/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-500 [&::-webkit-slider-thumb]:rounded-full"
                />
                <div className="flex justify-between text-sm md:text-base font-medium text-black/60 dark:text-primary-200 mt-2 font-mono">
                  <span>0 FCFA</span>
                  <span>{priceRange[1].toLocaleString()} FCFA</span>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <div className="flex justify-between items-center border-b border-primary-500/20 pb-2 mb-4">
                  <h3 className="text-base font-medium font-bold uppercase tracking-widest text-black dark:text-white">Size</h3>
                  {selectedSizes.length > 0 && (
                    <button onClick={() => setSelectedSizes([])} className="text-sm md:text-base font-medium text-black/60 dark:text-primary-200 hover:text-primary-500 uppercase tracking-widest">Clear</button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1 rounded-full border text-sm md:text-base font-medium font-bold uppercase tracking-tighter transition-colors ${selectedSizes.includes(size) ? 'bg-primary-500 text-black border-primary-500' : 'border-primary-500/20 text-black/60 dark:text-primary-200 hover:border-primary-500 hover:text-primary-500'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exclusives */}
              <div>
                <h3 className="text-base font-medium font-bold uppercase tracking-widest border-b border-primary-500/20 pb-2 mb-4 text-dark-900 dark:text-white">Collections</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${showPromotions ? 'bg-primary-500 border-primary-500' : 'border-primary-500/30 group-hover:border-primary-500'}`}>
                      {showPromotions && <div className="w-2 h-2 bg-black rounded-sm" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={showPromotions} onChange={(e) => setShowPromotions(e.target.checked)} />
                    <span className="text-base font-medium text-black/60 dark:text-primary-200 group-hover:text-primary-500 transition-colors">Promotions</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${showFeatured ? 'bg-primary-500 border-primary-500' : 'border-primary-500/30 group-hover:border-primary-500'}`}>
                      {showFeatured && <div className="w-2 h-2 bg-black rounded-sm" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={showFeatured} onChange={(e) => setShowFeatured(e.target.checked)} />
                    <span className="text-base font-medium text-black/60 dark:text-primary-200 group-hover:text-primary-500 transition-colors">Featured Editions</span>
                  </label>
                </div>
              </div>

              {(selectedCategory !== 'all' || selectedSizes.length > 0 || selectedColors.length > 0 || showPromotions || showFeatured || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2 border border-primary-500/50 dark:border-dark-600 dark:border-dark-700 rounded-lg text-base font-medium uppercase tracking-widest font-bold hover:bg-primary-50 dark:hover:bg-black transition-colors"
                >
                  retirer tous les filtres 
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <section className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-black rounded-2xl border border-primary-500/10">
                <ShoppingBag className="w-12 h-12 mx-auto text-primary-500/50 mb-4" />
                <h3 className="text-2xl font-bold font-serif italic mb-2">Aucun produit trouvé</h3>
                <p className="text-black/70 dark:text-primary-100 text-base font-medium">Affinez votre recherche ou consultez une autre catégorie.</p>
                <button
                  onClick={clearFilters}
                  className="mt-6 px-6 py-2 bg-primary-500 text-black rounded-lg text-base font-medium font-bold uppercase tracking-widest hover:shadow-lg transition-all"
                >
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {currentProducts.map((product) => (
                    <Productcard
                      key={product.id}
                      product={product}
                      onAddToCart={(p) => addToCart(p)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-4 border-t border-primary-500/10 pt-8">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-lg border border-primary-500/20 flex items-center justify-center text-black/60 dark:text-primary-200 hover:text-primary-500 hover:border-primary-500 transition-all disabled:opacity-30 disabled:hover:text-black/60 dark:text-primary-200 disabled:hover:border-primary-500/20"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => paginate(i + 1)}
                          className={`w-10 h-10 rounded-lg transition-colors text-base font-medium font-mono ${currentPage === i + 1 ? 'bg-primary-500 text-black font-bold shadow-md' : 'hover:bg-primary-500/10 text-black/60 dark:text-primary-200'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-lg border border-primary-500/20 flex items-center justify-center text-black/60 dark:text-primary-200 hover:text-primary-500 hover:border-primary-500 transition-all disabled:opacity-30 disabled:hover:text-black/60 dark:text-primary-200 disabled:hover:border-primary-500/20"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductsPublic;