// src/app/api/auth/logout/route.js

import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ message: 'Logged out' });

    response.cookies.set('auth_token', '', {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   0, // ← immediately expires the cookie
        path:     '/',
    });

    return response;
}