
import { NextResponse } from "next/server";
import Stripe from "stripe";
import jwt from "jsonwebtoken";

import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";
import Cart from "@/models/Cart";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
            return NextResponse.json(
                { message: "Missing checkout session ID." },
                { status: 400 }
            );
        }

        // 1. Verify actual Stripe session
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
            return NextResponse.json(
                { message: "Payment has not been confirmed yet." },
                { status: 400 }
            );
        }

        await dbConnect();

        // 2. Find order
        const orderId = session.metadata?.orderId;

        if (!orderId) {
            return NextResponse.json(
                { message: "Order reference not found." },
                { status: 404 }
            );
        }

        const order = await Order.findOne({
            _id: orderId,
            stripeSessionId: sessionId,
        });

        if (!order) {
            return NextResponse.json(
                { message: "Order not found." },
                { status: 404 }
            );
        }

        // 3. Update order payment status
        order.status = "paid";
        await order.save();

        // 4. Clear MongoDB cart for authenticated user
        const token = req.cookies.get("auth_token")?.value;

        if (token) {
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                if (
                    decoded.type === "session" &&
                    decoded.userId
                ) {
                    const cartResult = await Cart.updateOne(
                        { user: decoded.userId },
                        { $set: { items: [] } }
                    );

                    console.log("CART CLEAR RESULT:", cartResult);
                }
            } catch (authError) {
                console.error("CART AUTH ERROR:", authError);
            }
        }

        // 5. Return order details
        return NextResponse.json({
            success: true,
            order: {
                orderId: order._id.toString(),
                email: order.email,
                customer: order.customer,
                items: order.items.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    quantity: item.quantity,
                    discountPercent: item.discountPercent,
                    total: item.total,
                })),
                subtotal: order.subtotal,
                discount: order.discount,
                total: order.total,
                currency: order.currency,
                status: order.status,
                paidAmount: session.amount_total / 100,
                paymentStatus: session.payment_status,
                paymentIntent:
                    typeof session.payment_intent === "string"
                        ? session.payment_intent
                        : session.payment_intent?.id || null,
                createdAt: order.createdAt,
            },
        });

    } catch (error) {
        console.error("SUCCESS API ERROR:", error);

        return NextResponse.json(
            { message: "Unable to retrieve order details." },
            { status: 500 }
        );
    }
}
