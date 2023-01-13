const ProductModel = require("../models/productModel")
const User = require('../models/userModel')
const Coupon = require('./../models/couponModel')

const { ObjectId } = require('mongodb');

class ProductController {
//delete product from category
//delete category - delete all ocurrence of that category in all products
//add product to cart, remove product from cart
//add product to wishlist , remove product from wihlist
//

  async createProduct(req, res, next) {
    try {
      const {productName, description, productCategory, price, quantity, model, color, weight, images, thumbnail} = req.body;
     
      
      if(!productName || !description || !price || !quantity) {
        return res.status(400).send("Please provide more details for the product")
      }

      const product = new ProductModel({productName, description, productCategory, price, quantity, model, color, weight})
      await product.save()

      res.status(200).json(product)

    } catch (error) {
      next(error)
    }
  }

  async getProduct(req, res, next) {
    try {
      const product = await ProductModel.find()
      res.status(200).json(product)
    } catch (error) {
      next(error)
    }
  }

  async getProductByID(req, res, next) {
    try {
      const productID = req.params.id
      const product = await ProductModel.findById(productID)
      if(!product) {
        return res.status(400).send("There are no product to display")      
      }
      res.status(200).json(product)
    } catch (error) {
      next(error)
    }
  }

  async updateProduct(req, res, next) {
    try {
      const productID = req.params.id
      const {productName, description, productCategory, price, quantity, model, color, weight} = req.body;
      const product = await ProductModel.findById(productID)
      if(!product) {
        return res.status(400).send("There are no product to update") 
      }

      const productUpdate = await ProductModel.findByIdAndUpdate(productID, req.body, {new: true})
      res.status(200).json(productUpdate)

    } catch (error) {
      next(error)
    }
  }

  async deleteProduct(req, res, next) {
  
    try {
      const productID = req.params.id
      const product = await ProductModel.findById(productID)
      if(!product) {
        return res.status(400).send("There are no product to update") 
      }
  
      const productToDelete = await ProductModel.findByIdAndDelete(productID)
      res.status(200).json(productToDelete)
    } catch (error) {
      next(error)
    }
  }

  async addProductToCart(req, res) {
    //coupon feature
    //get user
    //deconstruct cart from user 
    // create a new variable
    //add get product
    //check if the product is available and amount is >=  product remaining in stock
    //spread existing array element inside new variable, add new product and quantity to the array
    //increment cart amount by the product rate * quantity
    //update user with new cart
    //

    try {
      // await User.updateMany(
      //   {},
      //   {
      //     $set: {
      //       cart: {
      //         cartTotal: 0,
      //         cartItems: []
      //       }
      //     }
      //   }
      // )
      const {userId} = req.params
      const {productId, quantity} = req.body
      const product = await ProductModel.findById(productId).select("_id isAvailable quantity price")
      // !product.isAvailable || 
      if(product.quantity <= 0) {
        res.status(400)
        .json({
          status: "FAILED",
          message: "This product is no longer available"
        })
      } else if(quantity > product.quantity) {
        res.status(400)
        .json({
          status: "FAILED",
          message: "This product remaining in stock is less than what you want"
        })
      }

      // console.log(product);
      const productPrice = product.price
      const productSumTotal = productPrice * quantity
      console.log(productSumTotal);
      // const user = await User.findById(userId).select('_id cart')
      // let  {cart: {cartItems: cart}} = user
      // cart = [...cart,
      // {
      //   itemQuantity: quantity,
      //   item: productId
      // }
      // ]
             // $set: {
        
          //   "cart.cartItems.$":   {
          //     itemQuantity: quantity,
          //     item: productId
          //   }
          // },
          // $inc: {
          //     "cart.cartTotal": productSumTotal
          //   }
      // console.log(cart)
      const updateCart = await User.updateOne(
        {_id: userId},
        {
          $push: { "cart.cartItems":   {
            itemQuantity: quantity,
            item: productId,
            price: productPrice
          }, 
        },
          $inc: {
            "cart.cartTotal": productSumTotal
          } 
        }
      )
      const userCart = await User.findById(userId)
      const {cart: newCart} = userCart
        console.log(updateCart)
        res.status(201).json({
          status: "SUCCESS",
          message: "Cart all updated successfully",
          data: newCart
        })
    } catch (error) {
      console.log(error);
      res.status(400)
      .json({
        status: "FAILED",
        message: "An error occurred"
      })
    }
  }

  async removeProductFromCart(req, res) {
    //get userid and productid from req
    //get user and get user cart 
    //look for the productid in user cart
    //pop the object where that productid exist
    //reduce cartTotal by the product price
    // return a response to the user of the updated cart
    try {
      //what if the product price change
      
      //pop that product from the cart items 
      //recalculate the cart
      const {userID} = req.params, {productID} = req.body

      const user = await User.findById(userID)
      let {cart: {cartItems}} = user
      const {cart: {cartTotal}} = user

      console.log(cartItems)
      console.log(cartTotal);
      cartItems = cartItems.filter((element) => element.item.toString() !== productID.toString())
      console.log(cartItems);
      const newCartTotal = cartItems.reduce((acc, currentValue) => acc + currentValue.price, 0)
      console.log(newCartTotal);
      await User.updateOne(
        {_id: userID},
        {
          "cart.cartItems": cartItems,
          "cart.cartTotal": newCartTotal
        }
      )

      const newUserCart = await User.findById(userID).select('cart')
      const updatedCart =  newUserCart.cart
      res.status(200)
      .json({
        status: "SUCCESS",
        message: "Cart has been updated",
        data: updatedCart
      }) 
      // const removeItem = await User.updateOne(
      //   {
      //     _id: userID
      //   },
      //   [
      //     {
      //       $project: {
      //         "cart.cartTotal": {
      //           $let: {
      //             vars: {
      //               newCartTotal: "$cart.cartTotal"
      //             },
      //             in: {
      //               $subtract: ["$$newCartTotal",]
      //             }
      //           }
      //         }
      //       }
      //     }
      //   ]
        // {
        //   $project: {
        //     "cart.cartTotal": {
        //       $let: {
        //         vars: {
        //           cartSum: "$cart.cartTotal"
        //         }
        //       }
        //     }
        //   }
        // }
        // {
        //   $lookup: {
        //     from: "products",
        //     "let": {"catID": "$_id"},
        //     pipeline: [
        //       {
        //         "$match": {
        //           "$expr": {
        //             "$in": ["$$catID", "$productCategory"],
        //           },
        //         },
        //       },
        //     ],
        //     as: "products"
        //   }
        // }
      // )


      // const updateCart = await User.updateOne(
      //   {_id: userID},
      //   {
      //     $pull: {
      //       "cart.cartItems": {item: productID} 
      //     }
      //   }
      // )
    // console.log(removeItem);
      // res.send("all good for now")

    } catch (error) {
      console.log(error);
      res.status(400)
      .json({
        status: "FAILED",
        message: "An error occurred"
      })
    }
  }

  async addProductToWshlist(req, res) {
    try {
      
      const {userID} = req.params, {productID} = req.body

      const productExists = await ProductModel.findById(productID)
      if(!productExists) {
        res.status(400)
        .json({
          status: "FAILED",
          message: "This product does not exists"
        })
      }

      //update user wishlist object
      await User.updateOne(
        {_id: userID},
        {
          $addToSet: {wishList: productID}
        }
      )

      const updatedWishlist = await User.findById(userID).populate('wishList').select('wishList')
      const {wishList} = updatedWishlist

      res.status(201)
      .json({
        status: "SUCCESS",
        message: "wishlist has been updated successfully",
        data: wishList
      })

    } catch (error) {
      console.log(error);
      res.status(400)
      .json({
        status: "FAILED",
        message: "An error occurred"
      })
    }
  }

  async removeProductFromWishlist(req, res) {
    try {
      const {userID} = req.params, {productID} = req.body

      await User.updateOne(
        {_id: userID},
        {
          $pull: {wishList: productID}
        }
      )

      const updatedWishlist = await User.findById(userID).populate('wishList').select('wishList')
      const {wishList} = updatedWishlist
        console.log(wishList);
      res.status(201)
      .json({
        status: "SUCCESS",
        message: "wishlist has been updated successfully",
        wishList
      })

    } catch (error) {
      console.log(error);
      res.status(400)
      .json({
        status: "FAILED",
        message: "An error occurred"
      })
    }
  }

  async createCouponCode(req, res) {
    //create the coupon
    //what does the code do - discount the price of items, date validity, rate validity
    //reduce the price of the product
    //apply coupon code when adding to cart
    //during checkout, validity of coupon code is also checked
    //create
    try {
      const {couponCode, expiresAt, applyableCount, limitedTime} = req.body
      let {dscPercentage, dscAmount} = req.body
      dscPercentage = dscPercentage ? dscPercentage : 0
      dscAmount = dscAmount ? dscAmount : 0

      if(!couponCode || (!dscPercentage && !dscAmount)) {
        return res.status(400)
        .json({
          status: "FAILED",
          message: "Please provide couponCode, dscPercentage or dscAmount"
        })
      }


      const newCoupon = new Coupon({
        couponCode,
        dscPercentage,
        dscAmount,
        expiresAt,
        applyableCount,
        limitedTime
      })

      newCoupon.save()

      res.status(201)
      .json({
        status: "SUCCESS",
        message: "coupon has has been created successfully",
        newCoupon
      })
      
    } catch (error) {
      console.log(error);
      res.status(400)
      .json({
        status: "FAILED",
        message: "An error occurred"
      })
    }
  }

}

module.exports = ProductController