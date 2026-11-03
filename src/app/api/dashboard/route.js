import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        await dbConnect();

        const email = decoded.email?.trim();

        if (!email) {
            return NextResponse.json(
                { success: false, message: "User email not found in token" },
                { status: 400 }
            );
        }

        const orders = await Order.find({
            email: {
                $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i",
            },
        })
            .sort({ createdAt: -1 })
            .lean();

        const paidStatuses = [
            "paid",
            "completed",
            "delivered",
            "processing",
        ];

        const completedStatuses = [
            "paid",
            "completed",
            "delivered",
        ];

        const pendingStatuses = [
            "pending",
            "processing",
        ];

        const totalSpent = orders.reduce((total, order) => {
            const status = String(order.status || "").toLowerCase();

            return paidStatuses.includes(status)
                ? total + Number(order.total || 0)
                : total;
        }, 0);

        const completedOrders = orders.filter((order) =>
            completedStatuses.includes(
                String(order.status || "").toLowerCase()
            )
        ).length;

        const pendingOrders = orders.filter((order) =>
            pendingStatuses.includes(
                String(order.status || "").toLowerCase()
            )
        ).length;

        const recentOrders = orders.slice(0, 5).map((order) => ({
            id: order._id.toString(),
            date: order.createdAt,
            items: Array.isArray(order.items)
                ? order.items.reduce(
                      (total, item) =>
                          total + Number(item.quantity || 0),
                      0
                  )
                : 0,
            total: Number(order.total || 0),
            currency: order.currency || "usd",
            status: order.status || "pending",
        }));

        return NextResponse.json({
            success: true,
            stats: {
                totalOrders: orders.length,
                totalSpent,
                completedOrders,
                pendingOrders,
            },
            recentOrders,
        });
    } catch (error) {
        console.error("Dashboard API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to load dashboard data.",
            },
            { status: 500 }
        );
    }
}