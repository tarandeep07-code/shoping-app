"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import Link from "next/link";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const categories = ["All", ...new Set(products.map((product) => product.category))];

  const filteredProducts = selectedCategory === "All" ? products
    : products.filter((product) => product.category === selectedCategory);

  // const addToCart = useCartStore(
  //   (state) => state.addToCart
  // );
  const { add } = useCart(); // ← swap this

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");

        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return <p></p>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full border transition ${selectedCategory === category
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="border border-gray-300 p-4 rounded"
          >
            <Link href={`/product/${product.id}`} prefetch={false}>
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-64 object-cover rounded-lg"
              />
              <h2 className="text-lg font-bold">
                {product.name}
              </h2>

              <p className="mt-2">
                ${product.price}
              </p>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  add({
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.image || '',
                  })
                }}
                className="mt-4 bg-black text-white px-4 py-2 rounded"
              >
                Add to Cart
              </button>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}