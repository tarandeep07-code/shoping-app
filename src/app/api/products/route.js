import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // If ID is provided
    if (id) {
      const product = await Product.findOne({
        id: Number(id),
      }).lean();

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: "Product not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        product,
      });
    }

    // If no ID is provided → return all products
    const products = await Product.find({})
      .sort({ id: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      products,
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