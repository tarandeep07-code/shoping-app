'use client';

import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';

export default function AuthProvider({ children }) {

    const { login, logout } = useAuthStore();
    const { cart, setCart } = useCartStore();

    useEffect(() => {
        const checkSession = async () => {
            try {
                // ── 1. Wait for Zustand to rehydrate from localStorage ──
                await useCartStore.persist.rehydrate();

                // ── 2. Read cart AFTER rehydration ──
                const rehydratedCart = useCartStore.getState().cart;

                // ── 3. Check session ──
                const res  = await fetch('/api/auth/me');
                const data = await res.json();

                if (!res.ok || !data.user) {
                    logout();
                    return;
                }

                login(data.user);

                // ── 4. Sync cart using rehydrated cart ──
                if (data.user.isNewUser) {
                    // New user → save guest cart (from localStorage) to DB
                    await fetch('/api/cart/sync', {
                        method:  'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body:    JSON.stringify({ cart: rehydratedCart }),
                    });
                    // Zustand already has correct cart

                } else {
                    // Existing user → fetch DB cart, replace Zustand
                    const cartRes  = await fetch('/api/cart');
                    const cartData = await cartRes.json();
                    if (cartRes.ok) setCart(cartData.cart);
                }
                
            } catch (error) {
                console.error('AuthProvider error:', error);
                logout();
            }
        };

        checkSession();
    }, []);

    return <>{children}</>;
}