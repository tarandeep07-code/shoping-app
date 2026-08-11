// src/app/api/cart/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongodb';
import Cart from '@/models/Cart';

function getUserFromCookie(req) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}

// ── GET: fetch user's cart from DB ──
export async function GET(req) {
    try {
        const decoded = getUserFromCookie(req);
        if (!decoded) {
            return NextResponse.json({ cart: [] }, { status: 401 });
        }

        await dbConnect();

        const cart = await Cart.findOne({ user: decoded.userId })
            .populate('items.product');

        if (!cart) return NextResponse.json({ cart: [] });

        // Map DB items to Zustand shape { id, name, price, image, quantity }
        const items = cart.items.map(i => ({
            id:       i.product._id.toString(),
            name:     i.product.name,
            price:    i.product.price,
            image:    i.product.image || '',
            quantity: i.quantity,
        }));

        return NextResponse.json({ cart: items });

    } catch (error) {
        console.error('GET /api/cart error:', error);
        return NextResponse.json({ cart: [] }, { status: 500 });
    }
}

// ── POST: save user's cart to DB ──
export async function POST(req) {
    try {
        const decoded = getUserFromCookie(req);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { cart } = await req.json(); // cart = Zustand cart array

        await dbConnect();

        // Only store product ObjectId + quantity in DB
        const dbItems = cart.map(i => ({
            product:  i.id, // your Zustand uses 'id' which is the MongoDB _id
            quantity: i.quantity,
        }));

        await Cart.findOneAndUpdate(
            { user: decoded.userId },
            { items: dbItems },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: 'Cart saved.' });

    } catch (error) {
        console.error('POST /api/cart error:', error);
        return NextResponse.json({ message: 'Failed to save cart.' }, { status: 500 });
    }
}