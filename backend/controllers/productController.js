const ProductModel = require("../models/productModel")
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


}

module.exports = ProductController