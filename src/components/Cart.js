
"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import useCartStore from "@/store/cartStore";
import Link from "next/link";
import { X, ShoppingCart, Trash2, Minus, Plus } from "lucide-react";

export default function Cart() {
    const {
        cart,
        increase,
        decrease,
        remove,
        clear,
        totalItems,
        subtotal,
        totalDiscount,
        finalTotal,
    } = useCart();

    const { isCartOpen, closeCart } = useCartStore();

    // Prevent background scrolling
    useEffect(() => {
        if (!isCartOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleEscape = (e) => {
            if (e.key === "Escape") closeCart();
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isCartOpen, closeCart]);

    return (
        <>
            {/* BACKDROP */}
            <div
                onClick={closeCart}
                className={`fixed inset-0 z-[100] bg-black/50 transition-opacity duration-300 ${
                    isCartOpen
                        ? "opacity-100 visible"
                        : "opacity-0 invisible pointer-events-none"
                }`}
            />

            {/* DRAWER */}
            <aside
                aria-hidden={!isCartOpen}
                className={`fixed top-0 right-0 z-[101] h-dvh w-full max-w-[380px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isCartOpen
                        ? "translate-x-0"
                        : "translate-x-full"
                }`}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-3">
                        <ShoppingCart size={22} />

                        <h2 className="text-xl font-bold">
                            Shopping Cart ({totalItems})
                        </h2>
                    </div>

                    <button
                        onClick={closeCart}
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                        aria-label="Close cart"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* CART CONTENT */}
                <div className="flex-1 overflow-y-auto p-5">

                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <ShoppingCart
                                size={55}
                                className="text-gray-300 mb-4"
                            />

                            <h3 className="text-xl font-semibold">
                                Your cart is empty
                            </h3>

                            <p className="text-gray-500 mt-2">
                                Add some products to get started.
                            </p>

                            <button
                                onClick={closeCart}
                                className="mt-6 bg-black text-white px-6 py-3 rounded-lg"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5">

                            {cart.map((item) => {
                                const itemSubtotal =
                                    Number(item.price) * item.quantity;

                                let discountPercent = 0;

                                if (item.quantity >= 10) {
                                    discountPercent = 20;
                                } else if (item.quantity >= 5) {
                                    discountPercent = 10;
                                } else if (item.quantity >= 3) {
                                    discountPercent = 5;
                                }

                                const itemDiscount =
                                    itemSubtotal * discountPercent / 100;

                                const itemFinal =
                                    itemSubtotal - itemDiscount;

                                return (
                                    <div
                                        key={item.id}
                                        className="border-b pb-5"
                                    >
                                        <div className="flex justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {item.name}
                                                </h3>

                                                <p className="text-gray-500 text-sm mt-1">
                                                    ${Number(item.price).toFixed(2)} / item
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => remove(item.id)}
                                                className="text-red-500 hover:text-red-700 h-fit"
                                                aria-label={`Remove ${item.name}`}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {/* QUANTITY */}
                                        <div className="flex items-center gap-3 mt-4">
                                            <div className="flex items-center border rounded-lg">
                                                <button
                                                    onClick={() => decrease(item.id)}
                                                    className="p-2 hover:bg-gray-100"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={15} />
                                                </button>

                                                <span className="px-4 font-semibold">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() => increase(item.id)}
                                                    className="p-2 hover:bg-gray-100"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={15} />
                                                </button>
                                            </div>

                                            <div className="ml-auto text-right">
                                                <p className="font-semibold">
                                                    ${itemFinal.toFixed(2)}
                                                </p>

                                                {itemDiscount > 0 && (
                                                    <p className="text-xs text-green-600">
                                                        {discountPercent}% OFF
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    )}
                </div>

                {/* FOOTER */}
                {cart.length > 0 && (
                    <div className="border-t p-5 bg-white shadow-[0_-5px_15px_rgba(0,0,0,0.04)]">

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Subtotal
                                </span>
                                <span>
                                    ${subtotal.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between text-green-600">
                                <span>
                                    Total Discount
                                </span>
                                <span>
                                    -${totalDiscount.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between text-lg font-bold border-t pt-3">
                                <span>Total</span>
                                <span>
                                    ${finalTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <Link
                            href="/cart"
                            onClick={closeCart}
                            className="block w-full text-center bg-black text-white py-3 rounded-lg mt-5 hover:bg-gray-800 transition"
                        >
                            View Full Cart
                        </Link>

                        <button
                            onClick={clear}
                            className="w-full text-sm text-red-500 mt-3 hover:underline"
                        >
                            Clear Cart
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
