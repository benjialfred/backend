import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { productAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/types';

interface FavoritesContextType {
    favorites: Product[];
    addFavorite: (product: Product) => void;
    removeFavorite: (productId: number) => void;
    isFavorite: (productId: number) => boolean;
    toggleFavorite: (product: Product) => void;
    favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<Product[]>([]);
    const { user } = useAuth();
    const [initialized, setInitialized] = useState(false);

    // Initial load from storage / backend
    useEffect(() => {
        const loadFavorites = async () => {
            if (user) {
                try {
                    const data = await productAPI.getFavorites();
                    const products = Array.isArray(data) ? data : (data as any).results || [];
                    setFavorites(products);
                } catch (err) {
                    console.error("Erreur chargement favoris", err);
                }
            } else {
                const savedFavorites = localStorage.getItem('favorites');
                if (savedFavorites) {
                    try {
                        setFavorites(JSON.parse(savedFavorites));
                    } catch (e) {
                        console.error("Failed to parse favorites from local storage", e);
                    }
                }
            }
            setInitialized(true);
        };
        loadFavorites();
    }, [user]);

    // Save to localStorage ONLY if completely guest
    useEffect(() => {
        if (initialized && !user) {
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
    }, [favorites, user, initialized]);

    const addFavorite = (product: Product) => {
        setFavorites(prev => {
            if (prev.some(item => item.id === product.id)) return prev;
            return [...prev, product];
        });
    };

    const removeFavorite = (productId: number) => {
        setFavorites(prev => prev.filter(item => item.id !== productId));
    };

    const isFavorite = (productId: number) => {
        return favorites.some(item => item.id === productId);
    };

    const toggleFavorite = async (product: Product) => {
        const currentlyFavorite = isFavorite(product.id);

        // Optimistic UI update
        if (currentlyFavorite) {
            removeFavorite(product.id);
            toast.success(`${product.nom} retiré des favoris`);
        } else {
            addFavorite(product);
            toast.success(`${product.nom} ajouté aux favoris`);
        }

        // Sync with backend if authenticated
        if (user) {
            try {
                await productAPI.toggleFavoriteAPI(product.id);
            } catch (error) {
                // Revert if API fails
                if (currentlyFavorite) {
                    addFavorite(product);
                } else {
                    removeFavorite(product.id);
                }
                toast.error("Erreur lors de la synchronisation des favoris.");
            }
        }
    };

    const favoritesCount = favorites.length;

    return (
        <FavoritesContext.Provider value={{
            favorites,
            addFavorite,
            removeFavorite,
            isFavorite,
            toggleFavorite,
            favoritesCount
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
