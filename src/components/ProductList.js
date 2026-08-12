"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="grid grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product._id}
          className="border border-gray-300 p-4 rounded"
        >
          <h2 className="text-lg font-bold">
            {product.name}
          </h2>

          <p className="mt-2">
            ${product.price}
          </p>

          <button
            onClick={() => add({
              id: product._id,  
              name: product.name,
              price: product.price,
              image: product.image || '',
            })}
            className="mt-4 bg-black text-white px-4 py-2 rounded"
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}