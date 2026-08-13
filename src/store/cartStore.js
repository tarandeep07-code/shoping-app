"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
    persist(
        (set, get) => ({
            cart: [],
            isCartOpen: false,

            openCart: () => set({ isCartOpen: true }),

            closeCart: () => set({ isCartOpen: false }),

            addToCart: (product) =>
                set((state) => {
                    const addQuantity = product.quantity || 1;

                    const existingProduct = state.cart.find(
                        (item) => item.id === product.id
                    );

                    if (existingProduct) {
                        return {
                            cart: state.cart.map((item) =>
                                item.id === product.id
                                    ? {
                                        ...item,
                                        quantity:
                                            item.quantity + addQuantity,
                                    }
                                    : item
                            ),
                            isCartOpen: true,
                        };
                    }

                    return {
                        cart: [
                            ...state.cart,
                            {
                                ...product,
                                quantity: addQuantity,
                            },
                        ],
                        isCartOpen: true,
                    };
                }),

            increaseQuantity: (productId) =>
                set((state) => ({
                    cart: state.cart.map((item) =>
                        item.id === productId
                            ? {
                                ...item,
                                quantity: item.quantity + 1,
                            }
                            : item
                    ),
                    isCartOpen: true,
                })),

            decreaseQuantity: (productId) =>
                set((state) => ({
                    cart: state.cart
                        .map((item) =>
                            item.id === productId
                                ? {
                                    ...item,
                                    quantity: item.quantity - 1,
                                }
                                : item
                        )
                        .filter((item) => item.quantity > 0),
                    isCartOpen: true,
                })),

            removeFromCart: (productId) =>
                set((state) => ({
                    cart: state.cart.filter(
                        (item) => item.id !== productId
                    ),
                    isCartOpen: true,
                })),

            clearCart: () =>
                set({
                    cart: [],
                    isCartOpen: true,
                }),

            setCart: (cart) =>
                set({
                    cart,
                }),
        }),
        {
            name: "shopping-cart",
        }
    )
);

export default useCartStore;