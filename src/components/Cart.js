"use client";

import { useCart } from "@/hooks/useCart"; // ← swap

export default function Cart() {

    const {
        cart,
        increase,
        decrease,
        remove,
        clear,
        totalItems,
        totalPrice,
    } = useCart(); // ← swap

    return (
        <div className="border border-gray-300 p-4">
            <h2 className="text-xl font-bold mb-4">
                Cart ({totalItems})
            </h2>

            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="space-y-4">
                    {cart.map((item) => (
                        <div key={item.id} className="border-b pb-4">
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p>${item.price}</p>
                                </div>
                                <button
                                    onClick={() => remove(item.id)} // ← swap
                                    className="bg-red-500 text-white px-3 py-1 rounded h-fit">
                                    Remove
                                </button>
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center gap-3 mt-3">
                                <button
                                    onClick={() => decrease(item.id)} // ← swap
                                    className="border border-gray-300 px-3 py-1 rounded">
                                    -
                                </button>
                                <span className="font-bold">{item.quantity}</span>
                                <button
                                    onClick={() => increase(item.id)} // ← swap
                                    className="border border-gray-300 px-3 py-1 rounded">
                                    +
                                </button>
                            </div>

                            <p className="mt-2">
                                Subtotal: ${(item.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    ))}

                    <div className="flex items-center justify-between pt-2">
                        <p className="font-bold text-lg">
                            Total: ${totalPrice.toFixed(2)}
                        </p>
                        <button
                            onClick={clear} // ← swap
                            className="bg-red-600 text-white px-4 py-2 rounded">
                            Clear Cart
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}