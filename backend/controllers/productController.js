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
  async checkCouponCode(coupon, productPrice) {
    const validCoupon = []
    let discountedPrice = productPrice
    let couponExists = await Coupon.find({couponCode: {$in: coupon}})
        if(!couponExists) {
          return;
        }
        for(let i = 0; i < couponExists.length; i++) {
          let currentCoupon = couponExists[i]
          if(!currentCoupon.valid) {
            continue;
          } else if(currentCoupon.limitedTime && currentCoupon.expiresAt < Date.now()) {
            continue;
          } else if(currentCoupon.applyCount && currentCoupon.applyableCount <= 0) {
            continue;
          }

          if(currentCoupon.dscPercentage) {
            //deduct the percentage from the price
            let discount = currentCoupon.dscPercentage / 100 * productPrice
            discountedPrice -= discount
          } else if(currentCoupon.dscAmount) {
            //deduct amount from product price
            let discount = currentCoupon.dscAmount
            discountedPrice -= discount >= discountedPrice ? 0 : discount 
          }
          validCoupon.push(currentCoupon._id)
        }
        return [
          discountedPrice,
          validCoupon
        ]
  }


  async createProduct(req, res) {
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
      console.log(error);
      res.status(400)
      .json({
        status: "FAILED",
        message: "An error occurred"
      })   
    }
  }

  async getProductByID(req, res) {
    try {
      const productID = req.params.id
      const product = await ProductModel.findById(productID)
      if(!product) {
        return res.status(400).send("There are no product to display")      
      }
      res.status(200).json(product)
    } catch (error) {
      console.log(error);
      res.status(400)
      .json({
        status: "FAILED",
        message: "An error occurred"
      })    }
  }

  async updateProduct(req, res) {
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
      console.log(error);
      res.status(400)
      .json({
        status: "FAILED",
        message: "An error occurred"
      })    }
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


    //during checkout, validity of coupon code is also checked

    try {

      const {userId} = req.params
      const {productId, quantity, coupon} = req.body
      let discountedPrice, validCoupon
      const product = await ProductModel.findById(productId).select("_id isAvailable quantity price")
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

      let productPrice = product.price
      let productSumTotal, couponApplied
      if(coupon && Array.isArray(coupon)) {
        //check if cupon exists and coupon is still valid
        //call a function for this
        const productController = new ProductController()
        const couponChecker = await productController.checkCouponCode(coupon, productPrice)
        if(couponChecker) {
          //apply coupon to product price
           [discountedPrice, validCoupon] = couponChecker
           productSumTotal = discountedPrice * quantity
           productPrice = discountedPrice
           couponApplied = true
        } else {
          productSumTotal = productPrice * quantity
          validCoupon = []
        }
      } else {
        productSumTotal = productPrice * quantity
        validCoupon = []
      }

      const updateCart = await User.updateOne(
        {_id: userId},
        {
          $push: { 
            "cart.cartItems": {
            itemQuantity: quantity,
            item: productId,
            price: productPrice,
            couponApplied,
            coupon: [...validCoupon]
          },
        },
          $inc: {
            "cart.cartTotal": productSumTotal
          } 
        }
      )
      const userCart = await User.findById(userId)
      const {cart: newCart} = userCart
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

    try {
      const {couponCode, expiresAt, applyableCount} = req.body
      let {dscPercentage, dscAmount} = req.body
      let applyCount, limitedTime;
      dscPercentage = dscPercentage ? dscPercentage : 0
      dscAmount = dscAmount ? dscAmount : 0
      

      if(!couponCode || (!dscPercentage && !dscAmount)) {
        return res.status(400)
        .json({
          status: "FAILED",
          message: "Please provide couponCode, dscPercentage or dscAmount"
        })
      }
      if(expiresAt) {
        limitedTime = true
      }
      if(applyableCount) {
        applyCount = true
      }
      const randomNumber = Math.floor(Math.random() * 100) + 1
      const randomCoupon = couponCode + randomNumber

      const newCoupon = new Coupon({
        couponCode: randomCoupon,
        dscPercentage,
        dscAmount,
        expiresAt,
        applyableCount,
        limitedTime,
        applyCount
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