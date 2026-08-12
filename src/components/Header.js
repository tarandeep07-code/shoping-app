"use client"

import Link from 'next/link';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import usecartStore from '@/store/cartStore';
import { useCart } from '@/hooks/useCart';
import Cart from '@/components/Cart';
import { useState } from 'react';

export default function Header() {

    const { user, logout } = useAuthStore();
    const [showCart, setShowCart] = useState(false);
    const { cart } = usecartStore();
    const { clear } = useCart();
    const router = useRouter();


    const handleLogout = async () => {
        // Clear cookie from server
        await fetch('/api/auth/logout', { method: 'POST' });
        // Clear store
        logout();
        clear();
        router.push('/login');
    };

    return (
        <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
                    Mini Shop
                </Link>

                {/* Right icons */}
                <div className="flex items-center gap-4">

                    {/* Cart */}
                    <div className="relative">
                        {/* Cart Button */}
                        <button
                            onClick={() => setShowCart((prev) => !prev)}
                            className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ShoppingCart size={22} />

                            <span className="absolute -top-0.5 -right-0.5 bg-orange-700 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {cart.reduce(
                                    (total, item) => total + item.quantity,
                                    0
                                )}
                            </span> 
                        </button>

                        {/* Cart Dropdown */}
                        {showCart && (
                            <div
                                className="absolute right-0 top-12 z-50 w-120 bg-white border border-gray-200 shadow-lg rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Cart />
                            </div>
                        )}
                    </div>

                    {/* User icon */}
                    <Link
                        href={user ? '/dashboard' : '/login'}
                        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                        title={user ? `Logged in as ${user.email}` : 'Sign in'}
                    >
                        <User size={22} />
                        <span className={`absolute bottom-1 right-1 w-2.5 h-2.5 border-2 border-white rounded-full ${user ? 'bg-green-500' : 'bg-red-400'
                            }`} />
                    </Link>

                    {/* Logout — only when logged in */}
                    {user && (
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="p-2 text-gray-600 hover:text-red-500 transition-colors cursor-pointer">
                            <LogOut size={22} />
                        </button>
                    )}

                </div>
            </div>
        </header>
    );
}