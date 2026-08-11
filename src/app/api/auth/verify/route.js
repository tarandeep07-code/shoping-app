// src/app/api/auth/verify/route.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(
                new URL("/login?error=missing_token", req.url)
            );
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.error("Verification token error:", error);

            return NextResponse.redirect(
                new URL("/login?error=expired_token", req.url)
            );
        }

        if (decoded.type !== "email_verification") {
            return NextResponse.redirect(
                new URL("/login?error=invalid_token", req.url)
            );
        }

        const email = decoded.email;

        if (!email) {
            return NextResponse.redirect(
                new URL("/login?error=invalid_token", req.url)
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        await dbConnect();
        let user = await User.findOne({ email: normalizedEmail });
          let isNewUser = false; // ← track if new or existing

        if (!user) {
            user = await User.create({
                email: normalizedEmail,
                name: decoded.name || "",
                emailVerified: true,
            });
             isNewUser = true; // ← guest cart will be saved to DB
        } else {
            // Existing user
            user.emailVerified = true;
            await user.save();
             isNewUser = false; // ← guest cart will be saved to DB
        }
        const sessionToken = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                isNewUser,
                type: "session",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        const response =
            NextResponse.redirect(
                new URL("/dashboard", req.url)
            );

        response.cookies.set(
            "auth_token",
            sessionToken,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
            }
        );

        return response;
    } catch (error) {
        console.error("AUTH VERIFY ERROR:", error);

        return NextResponse.redirect(
            new URL("/login?error=verification_failed", req.url)
        );
    }
}