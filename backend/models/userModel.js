const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  dateOfBirth: Date,
  password: {
    type: String
  },
  token: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum : ['customer','admin'],
    default: 'customer'
  },
  cart: {
    cartTotal: Number,
    cartItems: [
      {
        itemQuantity: Number,
        price: Number,
        item: {
          type:  mongoose.Types.ObjectId,
          ref: 'Product'
        },
        couponApplied: {
          type: Boolean,
          default: false
        },
        coupon: Array
      }     
    ]
  },
  wishList: [{
    type:  mongoose.Types.ObjectId,
    ref: 'Product'
  }]
}, 
{
  timestamps: true,
})

module.exports = mongoose.model("user", userSchema)