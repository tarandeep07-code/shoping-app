import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },

    stock: {
      type: Number,
      default: 100,
      min: 0,
    },

    category: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

export default Product;