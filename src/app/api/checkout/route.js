
import { NextResponse } from "next/server";
import Stripe from "stripe";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function calculateDiscount(quantity) {
    if (quantity >= 10) return 20;
    if (quantity >= 5) return 10;
    if (quantity >= 3) return 5;
    return 0;
}

export async function POST(req) {
    let order = null;

    try {
        const body = await req.json();
        const { customer, items } = body;

        // ---------------------------------------
        // 1. VALIDATE CUSTOMER DETAILS
        // ---------------------------------------

        if (
            !customer?.fullName?.trim() ||
            !customer?.email?.trim() ||
            !customer?.phone?.trim() ||
            !customer?.address?.trim() ||
            !customer?.city?.trim() ||
            !customer?.state?.trim() ||
            !customer?.postalCode?.trim() ||
            !customer?.country?.trim()
        ) {
            return NextResponse.json(
                { message: "Please complete all required customer details." },
                { status: 400 }
            );
        }

        const email = customer.email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { message: "Invalid email address." },
                { status: 400 }
            );
        }

        // ---------------------------------------
        // 2. VALIDATE CART
        // ---------------------------------------

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { message: "Your cart is empty." },
                { status: 400 }
            );
        }

        if (items.length > 100) {
            return NextResponse.json(
                { message: "Too many items in your cart." },
                { status: 400 }
            );
        }

        await dbConnect();

        // ---------------------------------------
        // 3. GET PRODUCTS FROM DATABASE
        // ---------------------------------------

        const productIds = items.map((item) =>
            item._id || item.id || item.product
        );

        const invalidId = productIds.some(
            (id) => !id || !mongoose.Types.ObjectId.isValid(id)
        );

        if (invalidId) {
            return NextResponse.json(
                { message: "Invalid product found in cart. Please refresh your cart." },
                { status: 400 }
            );
        }

        // Prevent duplicate product entries.
        const uniqueIds = [...new Set(productIds.map(String))];

        if (uniqueIds.length !== productIds.length) {
            return NextResponse.json(
                { message: "Duplicate products found in cart." },
                { status: 400 }
            );
        }

        const dbProducts = await Product.find({
            _id: { $in: uniqueIds },
        }).lean();

        if (dbProducts.length !== items.length) {
            return NextResponse.json(
                { message: "One or more products are no longer available." },
                { status: 400 }
            );
        }

        const productMap = new Map(
            dbProducts.map((product) => [
                product._id.toString(),
                product,
            ])
        );

        // ---------------------------------------
        // 4. CALCULATE TOTALS FROM DATABASE PRICES
        // ---------------------------------------

        let subtotalPaise = 0;
        let discountPaise = 0;

        const orderItems = items.map((item) => {
            const mongoProductId = String(
                item._id || item.id || item.product
            );
            const product = productMap.get(mongoProductId);

            if (!product) {
                throw new Error("Product not found.");
            }

            const quantity = Number(item.quantity);

            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 100
            ) {
                throw new Error(`Invalid quantity for ${product.name}.`);
            }

            if (
                !Number.isFinite(product.price) ||
                product.price <= 0
            ) {
                throw new Error(`Invalid price for ${product.name}.`);
            }

            if (product.stock < quantity) {
                throw new Error(
                    `Only ${product.stock} units of ${product.name} are available.`
                );
            }

            const unitPricePaise = Math.round(product.price * 100);
            const itemSubtotalPaise = unitPricePaise * quantity;

            const discountPercent = calculateDiscount(quantity);

            const itemDiscountPaise = Math.round(
                (itemSubtotalPaise * discountPercent) / 100
            );

            const itemTotalPaise =
                itemSubtotalPaise - itemDiscountPaise;

            subtotalPaise += itemSubtotalPaise;
            discountPaise += itemDiscountPaise;

            return {
                product: product._id,
                productId: product.id,
                name: product.name,
                image: product.image || "",
                price: unitPricePaise / 100,
                quantity,
                discountPercent,
                total: itemTotalPaise / 100,
                totalPaise: itemTotalPaise,
            };
        });

        const finalTotalPaise = subtotalPaise - discountPaise;

        if (finalTotalPaise <= 0) {
            return NextResponse.json(
                { message: "Invalid checkout amount." },
                { status: 400 }
            );
        }

        // ---------------------------------------
        // 5. CREATE PENDING ORDER
        // ---------------------------------------

        order = await Order.create({
            email,
            customer: {
                fullName: customer.fullName.trim(),
                phone: customer.phone.trim(),
                address: customer.address.trim(),
                apartment: customer.apartment?.trim() || "",
                city: customer.city.trim(),
                state: customer.state.trim(),
                postalCode: customer.postalCode.trim(),
                country: customer.country.trim(),
            },
            items: orderItems.map(({ totalPaise, ...item }) => item),
            subtotal: subtotalPaise / 100,
            discount: discountPaise / 100,
            total: finalTotalPaise / 100,
            currency: "usd",
            status: "pending",
        });

        // ---------------------------------------
        // 6. CREATE STRIPE CHECKOUT SESSION
        // ---------------------------------------

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        if (!baseUrl) {
            throw new Error("NEXT_PUBLIC_BASE_URL is not configured.");
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",

            customer_email: email,

            line_items: orderItems.map((item) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                        description:
                            `Quantity: ${item.quantity}. ` +
                            `Discount: ${item.discountPercent}%`,
                    },
                    // Stripe amount is in paise.
                    unit_amount: item.totalPaise,
                },
                quantity: 1,
            })),

            metadata: {
                orderId: order._id.toString(),
            },

            client_reference_id: order._id.toString(),

            success_url:
                `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,

            cancel_url:
                `${baseUrl}/checkout/cancel?order_id=${order._id}`,
        });

        // ---------------------------------------
        // 7. SAVE STRIPE SESSION ID
        // ---------------------------------------

        order.stripeSessionId = session.id;
        await order.save();

        return NextResponse.json({
            success: true,
            url: session.url,
            orderId: order._id.toString(),
        });

    } catch (error) {
        console.error("CHECKOUT ERROR:", error);

        // Mark order failed if Stripe session creation fails.
        if (order?._id && !order.stripeSessionId) {
            await Order.updateOne(
                { _id: order._id, status: "pending" },
                { $set: { status: "failed" } }
            ).catch((updateError) => {
                console.error("ORDER UPDATE ERROR:", updateError);
            });
        }

        return NextResponse.json(
            {
                message: error.message || "Unable to create checkout session.",
            },
            { status: 500 }
        );
    }
}
