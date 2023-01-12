const ProductModel = require("../models/productModel")
const User = require('../models/userModel')

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

      const {userID} = req.params, {productID} = req.body

      const removeItem = await User.updateOne(
        {
          _id: userID
        },
        [
          {
            $project: {
              "cart.cartTotal": {
                $let: {
                  vars: {
                    newCartTotal: "$cart.cartTotal"
                  },
                  in: {
                    $subtract: ["$$newCartTotal",]
                  }
                }
              }
            }
          }
        ]
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
      )


      // const updateCart = await User.updateOne(
      //   {_id: userID},
      //   {
      //     $pull: {
      //       "cart.cartItems": {item: productID} 
      //     }
      //   }
      // )
    console.log(removeItem);
      res.send("all good for now")

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