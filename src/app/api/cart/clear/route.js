
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { dbConnect } from "@/lib/mongodb";
import Cart from "@/models/Cart";

export async function DELETE(req) {
    try {
        const token = req.cookies.get("auth_token")?.value;

        // Guest user: nothing to clear from MongoDB
        if (!token) {
            return NextResponse.json({
                success: true,
                message: "Guest cart cleared locally.",
            });
        }

        // Verify logged-in user
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (
            decoded.type !== "session" ||
            !decoded.userId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid authentication token.",
                },
                { status: 401 }
            );
        }

        await dbConnect();

        // Clear the authenticated user's cart
        await Cart.updateOne(
            { user: decoded.userId },
            {
                $set: {
                    items: [],
                },
            }
        );

        return NextResponse.json({
            success: true,
            message: "Cart cleared successfully from database.",
        });

    } catch (error) {
        console.error("CLEAR CART API ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to clear cart.",
            },
            { status: 500 }
        );
    }
}
