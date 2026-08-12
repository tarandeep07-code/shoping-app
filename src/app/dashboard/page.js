"use client";

import React from "react";
import Link from "next/link";
import {ShoppingBag,ShoppingCart,Package,DollarSign,User,ArrowRight,Clock,CheckCircle} from "lucide-react";
import useAuthStore from "@/store/authStore";

export default function Page() {
    const { user } = useAuthStore();

    // Static data for now
    const stats = [
        {
            title: "Total Orders",
            value: "0",
            icon: Package,
            description: "Orders placed",
        },
        {
            title: "Total Spent",
            value: "$0",
            icon: DollarSign,
            description: "Lifetime spending",
        },
        {
            title: "Completed",
            value: "0",
            icon: CheckCircle,
            description: "Orders completed",
        },
    ];

    const recentOrders = [
        {
            id: "#ORD-1024",
            date: "Aug 10, 2026",
            items: 3,
            total: "$145.00",
            status: "Delivered",
        }
    ];

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Welcome back 👋
                            </p>

                            <h1 className="text-3xl font-bold text-gray-900">
                                My Dashboard
                            </h1>

                            <p className="text-gray-500 mt-2">
                                {user?.email || "user@example.com"}
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

                {/* Stats */}
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
                                        <p className="text-sm text-gray-500">
                                            {stat.title}
                                        </p>

                                        <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                            {stat.value}
                                        </h2>

                                        <p className="text-xs text-gray-400 mt-1">
                                            {stat.description}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <Icon
                                            size={21}
                                            className="text-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Grid */}
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
                                View all
                                <ArrowRight size={15} />
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
                                    {recentOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {order.id}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {order.date}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {order.items}
                                            </td>

                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {order.total}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        order.status ===
                                                        "Delivered"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                                >
                                                    {order.status ===
                                                    "Delivered" ? (
                                                        <CheckCircle size={13} />
                                                    ) : (
                                                        <Clock size={13} />
                                                    )}

                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Account Card */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">

                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Account
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Manage your account
                            </p>
                        </div>

                        <div className="p-6">

                            {/* Avatar */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center">
                                    <User size={25} />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {user?.name || "Shopping User"}
                                    </h3>

                                    <p className="text-sm text-gray-500 break-all">
                                        {user?.email || "user@example.com"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">

                                <Link
                                    href="/dashboard"
                                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <User size={18} />
                                        <span className="text-sm font-medium">
                                            My Profile
                                        </span>
                                    </div>

                                    <ArrowRight size={16} />
                                </Link>

                                <Link
                                    href="/dashboard"
                                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <Package size={18} />
                                        <span className="text-sm font-medium">
                                            My Orders
                                        </span>
                                    </div>

                                    <ArrowRight size={16} />
                                </Link>

                                <Link
                                    href="/dashboard"
                                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <ShoppingCart size={18} />
                                        <span className="text-sm font-medium">
                                            View Cart
                                        </span>
                                    </div>

                                    <ArrowRight size={16} />
                                </Link>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Quick Actions
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                        <Link
                            href="/"
                            className="bg-black text-white rounded-xl p-5 hover:bg-gray-800 transition"
                        >
                            <ShoppingBag size={22} className="mb-4" />

                            <h3 className="font-semibold">
                                Browse Products
                            </h3>

                            <p className="text-sm text-gray-300 mt-1">
                                Explore our latest products.
                            </p>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}