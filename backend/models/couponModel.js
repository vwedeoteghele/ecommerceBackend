const mongoose = require("mongoose");

const couponSchema = mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: Date,
    limitedTime: {
      type: Boolean,
      default: false
    },
    applyableCount: {
      type: Number
    },
    dscPercentage: {
      type: Number,
      default: 0
    },
    dscAmount: {
      type: Number,
      default: 0
    },
    valid: {
      type: Boolean,
      default: true
    }
  }, 
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Coupon", couponSchema);
