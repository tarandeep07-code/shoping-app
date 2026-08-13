"use client";

import Image from "next/image";

export default function RelatedProducts({ filterproducts = [] }) {
      if (!Array.isArray(filterproducts)) {
        return null;
    }
    return (
        <>
        <h1 className="text-black-700 pt-10">Related Products</h1>
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {filterproducts.map((product) => (
                <div
                    key={product._id}
                    className="relative border border-gray-200 rounded-2xl overflow-hidden bg-white"
                >

                    {/* Image */}
                    <div className="h-56 flex items-center justify-center bg-white">
                        <Image
                            src={product.image}
                            alt={product.name}
                            width={220}
                            height={220}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Product Info */}
                    <div className="px-3 pb-3">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                        </h3>

                        <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-bold text-teal-600">
                                ${product.price}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        </>
    );
}