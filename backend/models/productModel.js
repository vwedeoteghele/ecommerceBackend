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
    productCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    model: String,
    color: String,
    weight: Number

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
