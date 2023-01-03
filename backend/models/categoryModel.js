const mongoose = require("mongoose");
const ProductModel = require('../models/productModel')


const categorySchema = mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, "Please provide a category name"]
    },
    featured: {
      type: Boolean,
      default: false
    },
    tags: Array,
    image: String
  }, 
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
