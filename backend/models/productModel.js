const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Please provide a product Name"],
    },
    description: {
      type: String,
      required: [true, "Add a description to the product"],
    },
    productCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
      }
    ],
    available: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      required: true
    },
    discountedPrice: {
      type: Number
    },
    quantity: {
      type: Number,
      required: true
    },
    model: String,
    color: String,
    weight: Number,
    images: Array,
    thumbnail: String
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model("Product", productSchema);
module.exports = ProductModel
