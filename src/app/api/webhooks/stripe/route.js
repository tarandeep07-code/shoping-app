
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { message: "Missing Stripe signature." },
            { status: 400 }
        );
    }

    let event;

    try {
        const body = await req.text();

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error("Stripe signature error:", error.message);

        return NextResponse.json(
            { message: "Invalid webhook signature." },
            { status: 400 }
        );
    }

    try {
        await dbConnect();

        const session = event.data.object;

        if (
            event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded"
        ) {
            if (session.payment_status !== "paid") {
                return NextResponse.json({ received: true });
            }

            const orderId = session.metadata?.orderId;

            if (!orderId) {
                return NextResponse.json(
                    { message: "Order ID missing." },
                    { status: 400 }
                );
            }

            await Order.updateOne(
                {
                    _id: orderId,
                    status: "pending",
                },
                {
                    $set: {
                        status: "paid",
                        stripeSessionId: session.id,
                        stripePaymentIntentId:
                            typeof session.payment_intent === "string"
                                ? session.payment_intent
                                : session.payment_intent?.id || null,
                        stripeEventId: event.id,
                    },
                }
            );
        }

        if (
            event.type === "checkout.session.async_payment_failed" ||
            event.type === "checkout.session.expired"
        ) {
            const orderId = session.metadata?.orderId;

            if (orderId) {
                await Order.updateOne(
                    {
                        _id: orderId,
                        status: "pending",
                    },
                    {
                        $set: {
                            status:
                                event.type === "checkout.session.expired"
                                    ? "cancelled"
                                    : "failed",
                            stripeEventId: event.id,
                        },
                    }
                );
            }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("STRIPE WEBHOOK ERROR:", error);

        return NextResponse.json(
            { message: "Webhook processing failed." },
            { status: 500 }
        );
    }
}
