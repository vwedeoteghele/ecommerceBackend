const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true
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
