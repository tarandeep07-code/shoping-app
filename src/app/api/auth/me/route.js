// src/app/api/auth/me/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
    try {
        const token = req.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== 'session') {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findById(decoded.userId).select('-__v');

        if (!user) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        return NextResponse.json({
            user: {
                id:    user._id.toString(),
                email: user.email,
                 isNewUser: decoded.isNewUser, // ← pass to client
            }
        });

    } catch (error) {
        return NextResponse.json({ user: null }, { status: 401 });
    }
}