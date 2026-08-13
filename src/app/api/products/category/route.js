import { dbConnect } from "@/lib/mongodb";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        dbConnect();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");

        const filterproduct = await Product.find({
            category: String(category)
        }).limit(4).lean();

        if (!filterproduct) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Product not found",
                },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            filterproduct,
        });
    } catch (error) {
        console.error("GET PRODUCTS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch products",
            },
            { status: 500 }
        );
    }
}