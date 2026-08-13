"use client";

import Link from "next/link";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";
import { useCart } from "@/hooks/useCart";
import Cart from "@/components/Cart";

export default function Header() {
    const { user, logout } = useAuthStore();

    const {
        cart,
        isCartOpen,
        openCart,
        closeCart,
    } = useCartStore();

    const { clear } = useCart();

    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
        });

        logout();
        clear();

        closeCart();

        router.push("/login");
    };

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return (
        <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link
                    href="/"
                    className="text-xl font-bold text-gray-900 tracking-tight"
                >
                    Mini Shop
                </Link>

                {/* Right icons */}
                <div className="flex items-center gap-4">

                    {/* Cart */}
                    <div className="relative">

                        <button
                            onClick={() => {
                                if (isCartOpen) {
                                    closeCart();
                                } else {
                                    openCart();
                                }
                            }}
                            className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ShoppingCart size={22} />

                            <span className="absolute -top-0.5 -right-0.5 bg-orange-700 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        </button>

                        {/* Cart Dropdown */}
                        {isCartOpen && (
                            <div
                                className="absolute right-0 top-12 z-50 w-[480px] max-w-[calc(100vw-2rem)] bg-white border border-gray-200 shadow-lg rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Cart />
                            </div>
                        )}
                    </div>

                    {/* User */}
                    <Link
                        href={user ? "/dashboard" : "/login"}
                        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                        title={
                            user
                                ? `Logged in as ${user.email}`
                                : "Sign in"
                        }
                    >
                        <User size={22} />

                        <span
                            className={`absolute bottom-1 right-1 w-2.5 h-2.5 border-2 border-white rounded-full ${
                                user
                                    ? "bg-green-500"
                                    : "bg-red-400"
                            }`}
                        />
                    </Link>

                    {/* Logout */}
                    {user && (
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="p-2 text-gray-600 hover:text-red-500 transition-colors cursor-pointer"
                        >
                            <LogOut size={22} />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}