import { createContext, useContext, useState, type ReactNode, useEffect, type FC } from 'react';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import type { Product } from '@/types';

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on init
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product, quantity: number = 1) => {
        const existingItem = cartItems.find(item => item.id === product.id);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > (product.stock || 0)) {
                toast.error(`Stock insuffisant. Il ne reste que ${product.stock} unité(s).`);
                return;
            }
            toast.success(`Quantité de ${product.nom} mise à jour`);
            setCartItems(prev => prev.map(item =>
                item.id === product.id
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        } else {
            if (quantity > (product.stock || 0)) {
                toast.error(`Stock insuffisant. Il ne reste que ${product.stock} unité(s).`);
                return;
            }
            toast.success(`${product.nom} ajouté au panier`);
            setCartItems(prev => [...prev, { ...product, quantity }]);
        }
    };

    const removeFromCart = (productId: number) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity < 1) return;
        const item = cartItems.find(i => i.id === productId);
        if (item && quantity > (item.stock || 0)) {
            toast.error(`Stock insuffisant. Il ne reste que ${item.stock} unité(s).`);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.prix * item.quantity), 0);

    // Bonus Modal Logic
    const [showBonusModal, setShowBonusModal] = useState(false);
    const [hasShownBonus, setHasShownBonus] = useState(false);

    useEffect(() => {
        // Trigger only when hitting exactly 3 items and hasn't shown yet in this session (or reset logic if needed)
        const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

        if (totalItems === 3 && !hasShownBonus) {
            setShowBonusModal(true);
            setHasShownBonus(true);
        } else if (totalItems < 3) {
            // Optional: reset if they go below 3 so it can trigger again? 
            // Usually better to show once per "crossing" to 3.
            // Let's keep it simple: show once when it hits 3.
            setHasShownBonus(false);
        }
    }, [cartItems]);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
            <ConfirmationModal
                isOpen={showBonusModal}
                onClose={() => setShowBonusModal(false)}
                onConfirm={() => setShowBonusModal(false)}
                title="Félicitations !"
                message="Bravo, vous avez ajouté trois produits dans le panier !"
                type="success"
                confirmLabel="Super !"
                cancelLabel="Fermer"
            />
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
