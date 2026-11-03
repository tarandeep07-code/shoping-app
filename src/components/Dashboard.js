"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ShoppingBag,
  ShoppingCart,
  Package,
  DollarSign,
  User,
  ArrowRight,
  Clock,
  CheckCircle,
  MapPin,
  Eye,
  CalendarDays,
} from "lucide-react";

import useAuthStore from "@/store/authStore";

export default function Dashboard() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalOrders: 0,
      totalSpent: 0,
      completedOrders: 0,
      pendingOrders: 0,
    },
    recentOrders: [],
  });

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  // Redirect if user is not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Format currency
  const formatCurrency = (amount, currency = "usd") => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: String(currency).toUpperCase(),
      }).format(Number(amount) || 0);
    } catch {
      return `$${(Number(amount) || 0).toFixed(2)}`;
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    if (isLoading || !user) return;

    let cancelled = false;

    async function fetchDashboard() {
      try {
        setDashboardLoading(true);
        setDashboardError("");

        const response = await fetch("/api/dashboard", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load dashboard data.");
        }

        if (!cancelled) {
          setDashboardData({
            stats: {
              totalOrders: data.stats?.totalOrders || 0,
              totalSpent: data.stats?.totalSpent || 0,
              completedOrders: data.stats?.completedOrders || 0,
              pendingOrders: data.stats?.pendingOrders || 0,
            },
            recentOrders: data.recentOrders || [],
          });
        }
      } catch (error) {
        console.error("Dashboard error:", error);

        if (!cancelled) {
          setDashboardError(error.message);
        }
      } finally {
        if (!cancelled) {
          setDashboardLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [isLoading, user]);

  // Loading authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Dashboard statistics
  const stats = [
    {
      title: "Total Orders",
      value: dashboardData.stats.totalOrders,
      icon: Package,
      description: "All orders placed",
    },
    {
      title: "Total Spent",
      value: formatCurrency(dashboardData.stats.totalSpent),
      icon: DollarSign,
      description: "Successfully paid orders",
    },
    {
      title: "Completed Orders",
      value: dashboardData.stats.completedOrders,
      icon: CheckCircle,
      description: "Delivered or completed",
    },
    {
      title: "Pending Orders",
      value: dashboardData.stats.pendingOrders,
      icon: Clock,
      description: "Orders in progress",
    },
  ];

  const recentOrders = dashboardData.recentOrders;

  // Quick actions
  const quickActions = [
    {
      title: "My Orders",
      description: "View your order history",
      href: "/orders",
      icon: Package,
    },
    {
      title: "Saved Addresses",
      description: "Manage shipping addresses",
      href: "/addresses",
      icon: MapPin,
    },
    {
      title: "View Cart",
      description: "Check your shopping cart",
      href: "/cart",
      icon: ShoppingCart,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Welcome back 👋</p>

              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>

              <p className="text-gray-500 mt-2">
                Hello, {user?.name || user?.email}
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Dashboard Error */}
        {dashboardError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {dashboardError}
          </div>
        )}

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-2">
                      {dashboardLoading ? "..." : stat.value}
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      {stat.description}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Icon size={21} className="text-gray-700" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Your latest purchases
                </p>
              </div>

              <Link
                href="/orders"
                className="text-sm font-medium text-gray-700 hover:text-black flex items-center gap-1"
              >
                View all <ArrowRight size={15} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                      Order
                    </th>

                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                      Items
                    </th>

                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>

                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dashboardLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Loading orders...
                      </td>
                    </tr>
                  ) : dashboardError ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-red-500"
                      >
                        Unable to load orders.
                      </td>
                    </tr>
                  ) : recentOrders.length > 0 ? (
                    recentOrders.map((order) => {
                      const status = String(
                        order.status || "pending",
                      ).toLowerCase();

                      const isCompleted = [
                        "paid",
                        "completed",
                        "delivered",
                      ].includes(status);

                      const isPaid = status === "paid";

                      const isPending = ["pending", "processing"].includes(
                        status,
                      );

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            #{order.id.slice(-8).toUpperCase()}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            {order.date
                              ? new Date(order.date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "-"}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            {order.items}
                          </td>

                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(order.total, order.currency)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                isCompleted
                                  ? "bg-green-100 text-green-700"
                                  : isPaid
                                    ? "bg-blue-100 text-blue-700"
                                    : isPending
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                              }`}
                            >
                              {isCompleted || isPaid ? (
                                <CheckCircle size={13} />
                              ) : (
                                <Clock size={13} />
                              )}

                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Package
                          size={32}
                          className="mx-auto text-gray-300 mb-3"
                        />

                        <p className="font-medium text-gray-700">
                          No orders yet
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Your purchases will appear here.
                        </p>

                        <Link
                          href="/"
                          className="inline-block mt-4 text-sm font-medium underline"
                        >
                          Start shopping
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Account Information
              </h2>

              <p className="text-sm text-gray-500 mt-1">Your account details</p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center">
                  <User size={25} />
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    {user?.name || "Customer"}
                  </p>

                  <p className="text-sm text-gray-500 break-all">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-500">Account</span>

                  <span className="font-medium text-gray-800">Active</span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-500">Total Orders</span>

                  <span className="font-medium text-gray-800">
                    {dashboardLoading ? "..." : dashboardData.stats.totalOrders}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm transition group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Icon size={22} className="text-gray-700" />
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-gray-400 group-hover:text-black transition"
                    />
                  </div>

                  <h3 className="font-semibold text-gray-900">
                    {action.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recently Viewed Products Placeholder */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recently Viewed Products
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Products you have recently explored
              </p>
            </div>

            <Eye size={22} className="text-gray-500" />
          </div>

          <div className="py-10 text-center">
            <CalendarDays size={32} className="mx-auto text-gray-300 mb-3" />

            <p className="text-sm text-gray-500">
              Your recently viewed products will appear here.
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-gray-900 hover:underline"
            >
              Explore products <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
