"use client";
import { useEffect, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import useCartStore from "@/store/cartStore";

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
    const { openCart } = useCartStore();
    const previousCart = useRef(cart);

    useEffect(() => {
        // Don't open on initial render
        if (previousCart.current === cart) {
            previousCart.current = cart;
            return;
        }

        // Cart changed
        openCart();

        previousCart.current = cart;
    }, [cart, openCart]);

    return (
        <div className="border border-gray-300 p-4">
            <h2 className="text-xl font-bold mb-4">
                Cart ({totalItems})
            </h2>

            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="space-y-4">

                    {cart.map((item) => {

                        // -------------------------
                        // INDIVIDUAL PRODUCT TOTAL
                        // -------------------------

                        const itemSubtotal =
                            item.price * item.quantity;

                        let discountPercent = 0;

                        if (item.quantity >= 10) {
                            discountPercent = 20;
                        } else if (item.quantity >= 5) {
                            discountPercent = 10;
                        } else if (item.quantity >= 3) {
                            discountPercent = 5;
                        }

                        const itemDiscount =
                            itemSubtotal *
                            (discountPercent / 100);

                        const itemFinal =
                            itemSubtotal - itemDiscount;

                        return (
                            <div
                                key={item.id}
                                className="border-b pb-4"
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-semibold">
                                            {item.name}
                                        </p>

                                        <p>
                                            ${item.price}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() =>
                                            remove(item.id)
                                        }
                                        className="bg-red-500 text-white px-3 py-1 rounded h-fit"
                                    >
                                        Remove
                                    </button>
                                </div>

                                {/* Quantity */}
                                <div className="flex items-center gap-3 mt-3">
                                    <button
                                        onClick={() =>
                                            decrease(item.id)
                                        }
                                        className="border border-gray-300 px-3 py-1 rounded"
                                    >
                                        -
                                    </button>

                                    <span className="font-bold">
                                        {item.quantity}
                                    </span>

                                    <button
                                        onClick={() =>
                                            increase(item.id)
                                        }
                                        className="border border-gray-300 px-3 py-1 rounded"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Product subtotal */}
                                <p className="mt-2">
                                    Subtotal: $
                                    {itemSubtotal.toFixed(2)}
                                </p>

                                {/* Product discount */}
                                <p className="text-red-600">
                                    Discount ({discountPercent}% off):
                                    -$
                                    {itemDiscount.toFixed(2)}
                                </p>

                                {/* Product final price */}
                                <p className="font-semibold">
                                    Final: $
                                    {itemFinal.toFixed(2)}
                                </p>
                            </div>
                        );
                    })}

                    {/* CART SUMMARY */}
                    <div className="pt-2">
                        <p>
                            Final Subtotal: $
                            {subtotal.toFixed(2)}
                        </p>

                        <p className="text-red-600">
                            Total Discount: -$
                            {totalDiscount.toFixed(2)}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                            <p className="font-bold text-lg">
                                Total: $
                                {finalTotal.toFixed(2)}
                            </p>

                            <button
                                onClick={clear}
                                className="bg-red-600 text-white px-4 py-2 rounded"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}