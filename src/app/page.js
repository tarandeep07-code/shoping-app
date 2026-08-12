"use client";

import ProductList from "../components/ProductList";
import Cart from "../components/Cart";

export default function Home() {
  return (
<main className="p-6">
    <h1 className="text-3xl font-bold mb-6">
        Mini Shopping App
    </h1>

    <h2 className="text-2xl font-bold mb-4">
        Products
    </h2>

    <ProductList />
</main>
  );
}