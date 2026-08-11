"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
    persist(
        (set) => ({
            cart: [],

            addToCart: (product) =>
                set((state) => {
                    const existingProduct = state.cart.find(
                        (item) => item.id === product.id
                    );
                    if (existingProduct) {
                        return {
                            cart: state.cart.map((item) =>
                                item.id === product.id
                                    ? {
                                        ...item, quantity: item.quantity + 1,
                                    } : item
                            )
                        }
                    }
                    return {
                        cart: [...state.cart, { ...product, quantity: 1 }],
                    };
                }),
            increaseQuantity: (productId) =>
                set((state) => ({
                    cart: state.cart.map((item) =>
                        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
                    ),
                })),
            decreaseQuantity: (productId) =>
                set((state) => ({
                    cart: state.cart.map((item) =>
                        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
                    ).filter((item) => item.quantity > 0),
                })),

            removeFromCart: (productId) =>
                set((state) => ({
                    cart: state.cart.filter(
                        (item) => item.id !== productId
                    ),
                })),
            clearCart: () =>set({cart: []}),
            setCart: (cart) => set({ cart }),
        }),
        {
            name: "shopping-cart",
        }
    )
);

export default useCartStore;