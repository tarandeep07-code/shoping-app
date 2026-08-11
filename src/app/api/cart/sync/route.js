// src/app/api/cart/sync/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongodb';
import Cart from '@/models/Cart';

export async function POST(req) {
    try {
        const token = req.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { cart: guestCart } = await req.json();

        await dbConnect();

        const existingCart = await Cart.findOne({ user: decoded.userId });

        if (existingCart) {
            // Existing user → return DB cart
            const populated = await existingCart.populate('items.product');
            const cart = populated.items.map(i => ({
                id:       i.product._id.toString(),
                name:     i.product.name,
                price:    i.product.price,
                image:    i.product.image || '',
                quantity: i.quantity,
            }));

            return NextResponse.json({ cart, synced: 'existing' });
        }

        // New user → save guest cart to DB
        const dbItems = (guestCart || []).map(i => ({
            product:  i.id,
            quantity: i.quantity,
        }));

        await Cart.create({ user: decoded.userId, items: dbItems });

        // ── Issue new token with isNewUser: false so this doesn't repeat ──
        const newSessionToken = jwt.sign(
            {
                userId:    decoded.userId,
                email:     decoded.email,
                isNewUser: false, // ← cleared after first sync
                type:      'session',
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const response = NextResponse.json({
            cart:   guestCart || [],
            synced: 'new',
        });

        // ── Update cookie with new token ──
        response.cookies.set('auth_token', newSessionToken, {
            httpOnly: true,
            secure:   process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge:   60 * 60 * 24 * 7,
            path:     '/',
        });

        return response;

    } catch (error) {
        console.error('Cart sync error:', error);
        return NextResponse.json({ message: 'Cart sync failed.' }, { status: 500 });
    }
}