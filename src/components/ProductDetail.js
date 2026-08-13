'use client'
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import RelatedProducts from "@/components/RelatedProducts";
import { useCart } from "@/hooks/useCart";

export default function ProductDetail() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState("");
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const { add } = useCart();

    const getDiscountPercent = (qty) => {
        if (qty >= 10) return 20;
        if (qty >= 5) return 10;
        if (qty >= 3) return 5;

        return 0;
    };

    const discountPercent = getDiscountPercent(quantity);

    const subtotal = product
        ? product.price * quantity
        : 0;

    const discountAmount =
        subtotal * (discountPercent / 100);

    const finalTotal =
        subtotal - discountAmount;

    useEffect(() => {
        if (!id) return;

        async function fetchProduct() {
            try {
                setLoading(true);

                // 1. Get current product
                const response = await fetch(`/api/products?id=${id}`);
                const data = await response.json();

                if (data.success) {
                    setProduct(data.product);

                    // Get category from current product
                    const productCategory = data.product.category;

                    setCategory(productCategory);

                    console.log("Product:", data.product);
                    console.log("Category:", productCategory);

                    // 2. Get related products
                    const relatedResponse = await fetch(
                        `/api/products/category?category=${encodeURIComponent(
                            productCategory
                        )}`
                    );

                    const relatedData = await relatedResponse.json();

                    console.log("filterproduct:", relatedData.filterproduct);
                    console.log("is array:", Array.isArray(relatedData.filterproduct));

                    if (relatedData.success) {
                        setRelatedProducts(relatedData.filterproduct);

                        console.log(
                            "Related products:",
                            relatedData.filterproduct
                        );
                    }
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id]);

    if (!product) {
        return <div>Loading...</div>;
    }
    return (

        <div className="max-w-7xl mx-auto px-4 py-6">

            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-5">
                ← Back to Products
            </Link>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:sticky lg:top-20 lg:self-start">
                    <div className="relative bg-white border border-gray-200 rounded-3xl overflow-hidden">
                        <div className="aspect-square flex items-center justify-center p-8">
                            {product && (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={400}
                                    height={400}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-7">
                    <div className="flex items-start justify-between">
                        <div>
                            {product && (
                                <p className="text-sm italic text-gray-500">
                                    {product.category}
                                </p>
                            )}
                            {product && (
                                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mt-1">
                                    {product.name}
                                </h1>
                            )}
                        </div>
                        <button
                            className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition"
                        >
                            ♡
                        </button>
                    </div>

                    <div className="mt-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-medium">
                            ✓ Research Grade · Third-Party Verified
                        </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-5">
                        1 x Product Unit · Standard Packaging · Verified Quality
                    </p>

                    <div className="mt-7">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold">
                                Package Quantity
                            </h3>
                            <span className="text-xs text-gray-500">
                                Discounts auto-apply
                            </span>
                        </div>


                        <div className="grid grid-cols-4 gap-2">

                            {/* 1 UNIT */}
                            <button
                                type="button"
                                onClick={() => setQuantity(1)}
                                className={`relative border-2 rounded-xl p-4 text-center transition ${quantity === 1
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-primary"
                                    }`}
                            >

                                <div className="text-3xl font-bold">
                                    1
                                </div>

                                <div className="text-xs text-gray-500 font-semibold">
                                    UNIT
                                </div>

                                <div className="font-bold mt-3">
                                    ${product?.price?.toFixed(2)}
                                </div>

                                <div className="text-[10px] text-gray-400">
                                    per unit
                                </div>

                                <div className="mt-3 text-[10px] bg-gray-100 rounded px-2 py-1">
                                    STANDARD
                                </div>

                                <p className="text-xs text-gray-600 mt-3">
                                    Highest per-unit price
                                </p>
                            </button>


                            {/* 3 UNITS */}
                            <button
                                type="button"
                                onClick={() => setQuantity(3)}
                                className={`relative border-2 rounded-xl p-4 text-center transition ${quantity === 3
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-primary"
                                    }`}
                            >
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                                    STARTER
                                </span>
                                <div className="text-3xl font-bold">
                                    3
                                </div>

                                <div className="text-xs text-gray-500 font-semibold">
                                    UNITS
                                </div>

                                <div className="font-bold mt-3">
                                    ${product ? (product.price * 0.95).toFixed(2) : "0.00"}
                                </div>

                                <div className="text-[10px] text-gray-400 line-through">
                                    ${product?.price?.toFixed(2)}
                                </div>

                                <div className="mt-3 text-[10px] bg-emerald-100 text-emerald-700 rounded px-2 py-1 font-bold">
                                    SAVE 5%
                                </div>

                                <p className="text-xs text-emerald-600 mt-2">
                                    Try the stack
                                </p>
                            </button>


                            {/* 5 UNITS */}
                            <button
                                type="button"
                                onClick={() => setQuantity(5)}
                                className={`relative border-2 rounded-xl p-4 text-center transition ${quantity === 5
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-primary"
                                    }`}
                            >
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
                                    MOST POPULAR
                                </span>

                                <div className="text-3xl font-bold">
                                    5
                                </div>

                                <div className="text-xs text-gray-500 font-semibold">
                                    UNITS
                                </div>

                                <div className="font-bold mt-3">
                                    ${product ? (product.price * 0.90).toFixed(2) : "0.00"}
                                </div>

                                <div className="text-[10px] text-gray-400">
                                    per unit
                                </div>

                                <div className="mt-3 text-[10px] bg-emerald-100 text-emerald-700 rounded px-2 py-1 font-bold">
                                    SAVE 10%
                                </div>

                                <p className="text-xs text-emerald-600 mt-2">
                                    Best for ongoing use
                                </p>
                            </button>


                            {/* 10 UNITS */}
                            <button
                                type="button"
                                onClick={() => setQuantity(10)}
                                className={`relative border-2 rounded-xl p-4 text-center transition ${quantity === 10
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-primary"
                                    }`}
                            >
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
                                    BEST VALUE
                                </span>

                                <div className="text-3xl font-bold">
                                    10
                                </div>

                                <div className="text-xs text-gray-500 font-semibold">
                                    UNITS
                                </div>

                                <div className="font-bold mt-3">
                                    ${product ? (product.price * 0.80).toFixed(2) : "0.00"}
                                </div>

                                <div className="text-[10px] text-gray-400">
                                    per unit
                                </div>

                                <div className="mt-3 text-[10px] bg-emerald-100 text-emerald-700 rounded px-2 py-1 font-bold">
                                    SAVE 20%
                                </div>

                                <p className="text-xs text-emerald-600 mt-2">
                                    Lowest per-unit
                                </p>
                            </button>

                        </div>
                    </div>

                    <div className="mt-5 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">

                            <div>
                                <h3 className="text-sm font-bold">
                                    OR ENTER CUSTOM QUANTITY
                                </h3>

                                <p className="text-xs text-gray-500 mt-1">
                                    Maximum 10 units per order
                                </p>
                            </div>

                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantity((prev) => Math.max(1, prev - 1))
                                    }
                                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                                >
                                    −
                                </button>

                                <span className="w-12 text-center font-semibold">
                                    {quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantity((prev) => Math.min(10, prev + 1))
                                    }
                                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                                >
                                    +
                                </button>

                            </div>
                        </div>
                    </div>
                    <div className="mt-5 border border-gray-200 rounded-xl p-5">

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500">
                                    {quantity} {quantity === 1 ? "UNIT" : "UNITS"} TOTAL
                                </p>

                                <p className="text-sm text-gray-500 mt-1">
                                    Subtotal: ${subtotal.toFixed(2)}
                                </p>

                                {discountPercent > 0 && (
                                    <p className="text-sm text-green-600 mt-1">
                                        {discountPercent}% discount:
                                        -${discountAmount.toFixed(2)}
                                    </p>
                                )}
                            </div>

                            <div className="text-3xl font-bold text-primary">
                                ${finalTotal.toFixed(2)}
                            </div>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            add({
                                id: product._id,
                                name: product.name,
                                price: product.price,
                                image: product.image || "",
                                quantity: quantity,
                            });
                        }}
                        className="w-full mt-5 py-4 rounded-full bg-black hover:bg-primary text-white font-semibold transition"
                    >
                        Add {quantity} {quantity === 1 ? "Unit" : "Units"} to Cart
                    </button>
                    <div className="grid grid-cols-3 border-t border-gray-200 mt-5 pt-5">

                        <div className="text-center">
                            <div className="text-primary text-xl mb-2">
                                🚚
                            </div>
                            <h4 className="text-xs font-bold">
                                Fast Shipping
                            </h4>
                            <p className="text-[10px] text-gray-500 mt-1">
                                Same-day dispatch
                            </p>
                        </div>


                        <div className="text-center">
                            <div className="text-primary text-xl mb-2">
                                ♢
                            </div>
                            <h4 className="text-xs font-bold">
                                Quality Tested
                            </h4>
                            <p className="text-[10px] text-gray-500 mt-1">
                                Verified products
                            </p>
                        </div>


                        <div className="text-center">
                            <div className="text-primary text-xl mb-2">
                                ✓
                            </div>
                            <h4 className="text-xs font-bold">
                                Premium Quality
                            </h4>
                            <p className="text-[10px] text-gray-500 mt-1">
                                Quality verified
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-8">
                <h2 className="text-2xl font-bold">
                    Product Description
                </h2>
                {product && (
                    <p className="text-gray-600 mt-4 leading-7 max-w-4xl">
                        {product.description}
                    </p>
                )}

            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-5">Specifications</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b pb-3">
                            <span className="text-gray-500">Brand</span>
                            <strong>HealthCare</strong>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                            <span className="text-gray-500">Category</span>
                            <strong>Healthcare</strong>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                            <span className="text-gray-500">Size</span>
                            <strong>Standard</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">SKU</span>
                            <strong>PROD-001</strong>
                        </div>
                    </div>
                </div>


                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-5">Important Information</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li>✓ Read product information before use</li>
                        <li>✓ Follow the recommended instructions</li>
                        <li>✓ Store according to product requirements</li>
                        <li>✓ Keep away from children where applicable</li>
                    </ul>
                </div>
            </div>
            <RelatedProducts filterproducts={relatedProducts} />
        </div>
    )
}