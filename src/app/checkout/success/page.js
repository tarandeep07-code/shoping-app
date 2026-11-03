"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useCartStore from "@/store/cartStore";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "usd",
      maximumFractionDigits: 2,
    }).format(Number(price) || 0);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let cancelled = false;

    async function fetchOrder() {
      try {
        const response = await fetch(
          `/api/checkout/success?session_id=${encodeURIComponent(sessionId)}`,
        );

        const data = await response.json();
        console.log("SUCCESS API RESPONSE:", data);
console.log("ORDER STATUS:", data.order?.status);
console.log("PAYMENT STATUS:", data.order?.paymentStatus);

        if (!response.ok) {
          throw new Error(data.message || "Unable to retrieve order.");
        }

        if (!cancelled) {
          setOrder(data.order);

          // Clear cart only after confirmed successful payment
          if (
            data.order.status === "paid" &&
            data.order.paymentStatus === "paid"
          ) {
            try {
              // 1. Clear cart from MongoDB
              const clearResponse = await fetch("/api/cart/clear", {
                method: "DELETE",
              });

              if (!clearResponse.ok) {
                const clearData = await clearResponse.json();
                console.error(
                  "Database cart clearing failed:",
                  clearData.message,
                );
              }
            } catch (clearError) {
              console.error("Database cart clearing failed:", clearError);
            }

            // 2. Clear local Zustand cart
           if (
                data.order.status === "paid" &&
                data.order.paymentStatus === "paid"
            ) {
                // Clear Zustand and localStorage
                useCartStore.getState().clearCart();
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Loading Screen
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

        <h2 className="mt-6 text-xl font-bold text-gray-900">
          Confirming your payment...
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Please wait while we retrieve your order details.
        </p>
      </div>
    );
  }

  // Error Screen
  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl font-bold text-red-600">
          !
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          Unable to load your order
        </h2>

        <p className="mt-3 max-w-md text-gray-500">
          {error || "Order details could not be found."}
        </p>

        <Link
          href="/shop"
          className="mt-6 rounded-lg bg-gray-900 px-7 py-3 font-semibold text-white transition hover:bg-gray-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Success Screen
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        {/* Success Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-5xl font-bold text-green-600">
            ✓
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Thank You for Your Order!
          </h1>

          <p className="mt-3 text-base text-gray-500">
            Your payment was successful. We appreciate your purchase.
          </p>

          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-600" />
            Payment Successful
          </span>
        </div>

        {/* Order Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Order Heading */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-6 sm:p-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

              <p className="mt-2 break-all text-sm text-gray-500">
                Order ID: #{order.orderId}
              </p>

              {order.createdAt && (
                <p className="mt-1 text-sm text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>

            <span className="rounded-full bg-green-100 px-5 py-2 text-xs font-bold tracking-wide text-green-700">
              PAID
            </span>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 gap-6 border-b border-gray-100 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Customer Name
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {order.customer?.fullName}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Email Address
              </p>

              <p className="mt-2 break-all font-semibold text-gray-900">
                {order.email}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Shipping Address
              </p>

              <p className="mt-2 text-sm leading-7 text-gray-700">
                {[
                  order.customer?.address,
                  order.customer?.apartment,
                  order.customer?.city,
                  order.customer?.state,
                  order.customer?.postalCode,
                  order.customer?.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>

          {/* Purchased Items */}
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Items Purchased
              </h3>

              <span className="text-sm text-gray-500">
                {order.items.length} Products
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div
                  key={item.productId ?? index}
                  className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
                >
                  {/* Product Information */}
                  <div className="flex min-w-0 items-center gap-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 shrink-0 rounded-xl border border-gray-100 bg-gray-50 object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                        No Image
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="break-words font-semibold text-gray-900">
                        {item.name}
                      </h4>

                      <p className="mt-1 text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatPrice(item.price)} each
                      </p>

                      {item.discountPercent > 0 && (
                        <span className="mt-2 inline-flex rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          {item.discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Total */}
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-400 sm:hidden">
                      Item Total
                    </p>

                    <strong className="text-base font-bold text-gray-900">
                      {formatPrice(item.total)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t border-gray-100 bg-gray-50 p-6 sm:p-8">
            <div className="ml-auto max-w-sm space-y-4">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500">Subtotal</span>

                <strong className="text-gray-900">
                  {formatPrice(order.subtotal)}
                </strong>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="font-medium text-green-600">Discount</span>

                <strong className="text-green-600">
                  - {formatPrice(order.discount)}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-5">
                <span className="text-lg font-bold text-gray-900">
                  Total Paid
                </span>

                <strong className="text-2xl font-extrabold text-green-600">
                  {formatPrice(order.paidAmount)}
                </strong>
              </div>
            </div>
          </div>

          {/* Order Footer */}
          <div className="border-t border-gray-100 p-6 sm:p-8">
            <div className="rounded-xl border border-green-100 bg-green-50 p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl text-green-600">✓</span>

                <div>
                  <h4 className="font-semibold text-green-800">
                    Your order is confirmed!
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-green-700">
                    Your payment has been received successfully. Thank you for
                    shopping with us!
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm text-gray-500">
              Order Status:{" "}
              <span className="font-semibold capitalize text-green-600">
                {order.status}
              </span>
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Order confirmation: {order.email}
            </p>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-9 py-4 font-semibold text-white transition hover:bg-gray-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

// Default Page Export
export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
            <p className="mt-4 text-sm text-gray-500">
              Loading order details...
            </p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
