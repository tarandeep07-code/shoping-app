
"use client";

import { useCart } from "@/hooks/useCart";
import Link from "next/link";

export default function CartPage() {
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

    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">

                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Shopping Cart
                    </h1>
                    <p className="text-gray-500 mt-2">
                        You have {totalItems} items in your cart.
                    </p>
                </div>

                {cart.length === 0 ? (
                    /* EMPTY CART */
                    <div className="bg-white rounded-xl border p-12 text-center">
                        <div className="text-6xl mb-4">
                            🛒
                        </div>

                        <h2 className="text-2xl font-semibold">
                            Your cart is empty
                        </h2>

                        <p className="text-gray-500 mt-2 mb-6">
                            Looks like you have not added anything yet.
                        </p>

                        <Link
                            href="/"
                            className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* CART ITEMS */}
                        <div className="lg:col-span-2 space-y-4">

                            <div className="bg-white rounded-xl border p-5">
                                <div className="flex justify-between items-center mb-5">
                                    <h2 className="text-xl font-semibold">
                                        Cart Items ({totalItems})
                                    </h2>

                                    <button
                                        onClick={clear}
                                        className="text-sm text-red-600 hover:underline"
                                    >
                                        Clear Cart
                                    </button>
                                </div>

                                <div className="divide-y">
                                    {cart.map((item) => {

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
                                                className="py-6 flex flex-col sm:flex-row gap-5"
                                            >

                                                {/* PRODUCT DETAILS */}
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg">
                                                        {item.name}
                                                    </h3>

                                                    <p className="text-gray-500 mt-1">
                                                        ${Number(item.price).toFixed(2)} / item
                                                    </p>

                                                    {/* QUANTITY */}
                                                    <div className="flex items-center gap-3 mt-4">
                                                        <span className="text-sm text-gray-500">
                                                            Quantity:
                                                        </span>

                                                        <div className="flex items-center border rounded-lg">
                                                            <button
                                                                onClick={() => decrease(item.id)}
                                                                disabled={item.quantity <= 1}
                                                                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40"
                                                            >
                                                                -
                                                            </button>

                                                            <span className="px-4 font-semibold">
                                                                {item.quantity}
                                                            </span>

                                                            <button
                                                                onClick={() => increase(item.id)}
                                                                className="px-3 py-2 hover:bg-gray-100"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* DISCOUNT */}
                                                    {discountPercent > 0 && (
                                                        <p className="text-green-600 text-sm mt-3">
                                                            {discountPercent}% quantity discount applied
                                                        </p>
                                                    )}

                                                    <button
                                                        onClick={() => remove(item.id)}
                                                        className="text-red-500 text-sm mt-3 hover:underline"
                                                    >
                                                        Remove item
                                                    </button>
                                                </div>

                                                {/* PRICE */}
                                                <div className="sm:text-right">
                                                    <p className="font-semibold text-lg">
                                                        ${itemFinal.toFixed(2)}
                                                    </p>

                                                    {itemDiscount > 0 && (
                                                        <>
                                                            <p className="text-gray-400 line-through text-sm">
                                                                ${itemSubtotal.toFixed(2)}
                                                            </p>

                                                            <p className="text-green-600 text-sm">
                                                                Save ${itemDiscount.toFixed(2)}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <Link
                                href="/"
                                className="inline-block text-gray-700 hover:text-black"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>

                        {/* ORDER SUMMARY */}
                        <div>
                            <div className="bg-white rounded-xl border p-6 sticky top-6">

                                <h2 className="text-xl font-semibold mb-6">
                                    Order Summary
                                </h2>

                                <div className="space-y-4 text-sm">

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Total Items
                                        </span>
                                        <span className="font-medium">
                                            {totalItems}
                                        </span>
                                    </div>

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

                                    <div className="border-t pt-4 flex justify-between text-lg font-bold">
                                        <span>
                                            Total
                                        </span>
                                        <span>
                                            ${finalTotal.toFixed(2)}
                                        </span>
                                    </div>

                                </div>

                                <Link
                                    href="/checkout"
                                    className="block text-center bg-black text-white w-full py-3 rounded-lg mt-6 hover:bg-gray-800 transition"
                                >
                                    Proceed to Checkout
                                </Link>

                                <p className="text-xs text-gray-400 text-center mt-4">
                                    Discounts are calculated automatically.
                                </p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </main>
    );
}
