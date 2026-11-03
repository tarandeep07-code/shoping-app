
"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ShieldCheck,
    LockKeyhole,
    ShoppingBag,
    CheckCircle2,
    Loader2,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";

export default function CheckoutPage() {
    const {
        cart,
        totalItems,
        subtotal,
        totalDiscount,
        finalTotal,
    } = useCart();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        apartment: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (!cart.length) return;

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customer: form,
                    items: cart,
                    total: finalTotal,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to process checkout."
                );
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("Payment URL was not returned.");
            }
        } catch (err) {
            setError(err.message || "Something went wrong.");
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "usd",
            maximumFractionDigits: 2,
        }).format(Number(price) || 0);
    };
    // EMPTY CART
    if (cart.length === 0) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center max-w-md w-full shadow-sm">
                    <ShoppingBag
                        size={55}
                        className="mx-auto text-gray-300 mb-5"
                    />

                    <h1 className="text-2xl font-bold text-gray-900">
                        Your cart is empty
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Add some products before proceeding to checkout.
                    </p>

                    <Link
                        href="/"
                        className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-10 md:py-14">
            <div className="max-w-6xl mx-auto px-4">

                {/* PAGE HEADER */}
                <div className="mb-8">
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-5 transition"
                    >
                        <ArrowLeft size={16} />
                        Back to Cart
                    </Link>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Complete Your Order
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Enter your details and complete your payment securely.
                    </p>
                </div>

                <form onSubmit={handleCheckout}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT: CUSTOMER INFORMATION */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* CONTACT INFORMATION */}
                            <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7 shadow-sm">

                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Contact Information
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Where can we send your order updates?
                                    </p>
                                </div>

                                <div className="space-y-5">

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700">
                                            Full Name *
                                        </label>

                                        <input
                                            type="text"
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            required
                                            autoComplete="name"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                                Email Address *
                                            </label>

                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="example@email.com"
                                                required
                                                autoComplete="email"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                                Phone Number *
                                            </label>

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                placeholder="Enter phone number"
                                                required
                                                autoComplete="tel"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SHIPPING ADDRESS */}
                            <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7 shadow-sm">

                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Shipping Address
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Enter the address where you would like your order delivered.
                                    </p>
                                </div>

                                <div className="space-y-5">

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700">
                                            Street Address *
                                        </label>

                                        <input
                                            type="text"
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            placeholder="House number and street name"
                                            required
                                            autoComplete="address-line1"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700">
                                            Apartment, Suite, etc.
                                        </label>

                                        <input
                                            type="text"
                                            name="apartment"
                                            value={form.apartment}
                                            onChange={handleChange}
                                            placeholder="Apartment, floor, unit (optional)"
                                            autoComplete="address-line2"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                                City *
                                            </label>

                                            <input
                                                type="text"
                                                name="city"
                                                value={form.city}
                                                onChange={handleChange}
                                                placeholder="City"
                                                required
                                                autoComplete="address-level2"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                                State *
                                            </label>

                                            <input
                                                type="text"
                                                name="state"
                                                value={form.state}
                                                onChange={handleChange}
                                                placeholder="State"
                                                required
                                                autoComplete="address-level1"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                                Postal Code *
                                            </label>

                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={form.postalCode}
                                                onChange={handleChange}
                                                placeholder="Postal code"
                                                required
                                                autoComplete="postal-code"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                                Country *
                                            </label>

                                            <select
                                                name="country"
                                                value={form.country}
                                                onChange={handleChange}
                                                required
                                                autoComplete="country-name"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition bg-white"
                                            >
                                                <option value="India">India</option>
                                                <option value="United States">United States</option>
                                                <option value="United Kingdom">United Kingdom</option>
                                                <option value="Canada">Canada</option>
                                                <option value="Australia">Australia</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* PAYMENT INFORMATION */}
                            <section className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7 shadow-sm">

                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 bg-green-50 text-green-700 rounded-xl flex items-center justify-center shrink-0">
                                        <LockKeyhole size={22} />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Secure Payment
                                        </h2>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Your payment will be securely processed through Stripe.
                                        </p>
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-xl p-4 mt-6 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-[6px] border-black rounded-full shrink-0" />

                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">
                                                Pay securely online
                                            </p>

                                            <p className="text-xs text-gray-500 mt-1">
                                                Credit card, debit card and supported payment methods.
                                            </p>
                                        </div>
                                    </div>

                                    <ShieldCheck
                                        size={24}
                                        className="text-green-600 shrink-0"
                                    />
                                </div>

                                <p className="text-xs text-gray-400 mt-4">
                                    Your payment details are handled securely by Stripe.
                                    We do not store your card information.
                                </p>
                            </section>
                        </div>

                        {/* RIGHT: ORDER SUMMARY */}
                        <div className="lg:col-span-1">

                            <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm lg:sticky lg:top-24">

                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    Order Summary
                                </h2>

                                <div className="flex justify-between items-center text-sm mb-5">
                                    <span className="text-gray-500">
                                        Your Items
                                    </span>

                                    <span className="font-medium text-gray-900">
                                        {totalItems} items
                                    </span>
                                </div>

                                {/* PRODUCTS */}
                                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">

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
                                            (itemSubtotal * discountPercent) / 100;

                                        return (
                                            <div
                                                key={item.id}
                                                className="flex justify-between gap-3 border-b border-gray-100 pb-4"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm text-gray-900 truncate">
                                                        {item.name}
                                                    </p>

                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Qty: {item.quantity} × {formatPrice(item.price)}
                                                    </p>

                                                    {discountPercent > 0 && (
                                                        <p className="text-xs text-green-600 mt-1">
                                                            {discountPercent}% discount applied
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <p className="font-semibold text-sm text-gray-900">
                                                        {formatPrice(itemSubtotal - itemDiscount)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* PRICE BREAKDOWN */}
                                <div className="space-y-4 mt-6 text-sm">

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Subtotal
                                        </span>

                                        <span className="text-gray-900">
                                            {formatPrice(subtotal)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-green-600">
                                        <span>
                                            Discount
                                        </span>

                                        <span>
                                            -{formatPrice(totalDiscount)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Shipping
                                        </span>

                                        <span className="text-gray-500 text-xs">
                                            Calculated at checkout
                                        </span>
                                    </div>

                                    <div className="border-t border-gray-200 pt-5 flex justify-between items-center">
                                        <span className="font-bold text-lg text-gray-900">
                                            Total
                                        </span>

                                        <span className="font-bold text-2xl text-gray-900">
                                            {formatPrice(finalTotal)}
                                        </span>
                                    </div>
                                </div>

                                {/* ERROR */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm mt-5">
                                        {error}
                                    </div>
                                )}

                                {/* PAY NOW */}
                                <button
                                    type="submit"
                                    disabled={loading || cart.length === 0}
                                    className="w-full mt-6 bg-black text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2
                                                size={19}
                                                className="animate-spin"
                                            />
                                            Processing Payment...
                                        </>
                                    ) : (
                                        <>
                                            <LockKeyhole size={18} />
                                            Pay Now — {formatPrice(finalTotal)}
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-5">
                                    <ShieldCheck size={16} className="text-green-600" />
                                    Secure and encrypted checkout
                                </div>

                                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-3">
                                    <CheckCircle2 size={14} />
                                    Quantity discounts applied automatically
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="text-center text-xs text-gray-400 mt-10">
                    Thank you for shopping with Mini Shop.
                </div>
            </div>
        </main>
    );
}
