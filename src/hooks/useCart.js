// src/hooks/useCart.js

import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';

export function useCart() {

    const { user } = useAuthStore();

    const {
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        setCart,
    } = useCartStore();

    // ── Sync current cart array to DB ──
    const syncToDb = async (updatedCart) => {
        if (!user) return; // logged out — skip DB sync
        try {
            await fetch('/api/cart', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ cart: updatedCart }),
            });
        } catch (error) {
            console.error('Cart DB sync failed:', error);
        }
    };

    // ── Add to cart → Zustand + DB ──
    const add = (product) => {
        addToCart(product);
        const existing = cart.find(i => i.id === product.id);
        const updated  = existing
            ? cart.map(i => i.id === product.id
                ? { ...i, quantity: i.quantity + 1 } : i)
            : [...cart, { ...product, quantity: 1 }];
        syncToDb(updated);
    };
 
    // ── Increase quantity → Zustand + DB ──
    const increase = (productId) => {
        increaseQuantity(productId);
        const updated = cart.map(i =>
            i.id === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
        syncToDb(updated);
    };

    // ── Decrease quantity → Zustand + DB ──
    const decrease = (productId) => {
        decreaseQuantity(productId);
        const updated = cart
            .map(i => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i)
            .filter(i => i.quantity > 0);
        syncToDb(updated);
    };

    // ── Remove from cart → Zustand + DB ──
    const remove = (productId) => {
        removeFromCart(productId);
        const updated = cart.filter(i => i.id !== productId);
        syncToDb(updated);
    };

    // ── Clear cart → Zustand + DB ──
    const clear = () => {
        clearCart();
        syncToDb([]);
    };

    // Helpers
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return {
        cart,
        add,
        increase,
        decrease,
        remove,
        clear,
        setCart,
        totalItems,
        totalPrice,
        isLoggedIn: !!user,
    };
}