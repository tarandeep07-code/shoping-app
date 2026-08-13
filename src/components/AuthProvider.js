'use client';

import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';

export default function AuthProvider({ children }) {

    const { login, logout, setLoading } = useAuthStore();
    const { cart, setCart }             = useCartStore();

    useEffect(() => {
        const checkSession = async () => {
            try {
                setLoading(true); // ← mark as loading

                const res  = await fetch('/api/auth/me');
                const data = await res.json();

                if (!res.ok || !data.user) {
                    logout(); // sets isLoading: false inside
                    return;
                }

                login(data.user); // sets isLoading: false inside

                // Cart sync
                if (data.user.isNewUser) {
                    await fetch('/api/cart/sync', {
                        method:  'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body:    JSON.stringify({ cart }),
                    });
                } else {
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