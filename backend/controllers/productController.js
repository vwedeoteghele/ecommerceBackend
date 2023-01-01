const ProductModel = require("../models/productModel")
const { ObjectId } = require('mongodb');

class ProductController {

  async createProduct(req, res, next) {
    try {
      console.log("got here", req.body);
      const {productName, description, productCategory, price, quantity, model, color, weight} = req.body;
      if(!productName || !description || !price || !quantity) {
        return res.status(400).send("Please provide more details for the product")
      }

      const product = new ProductModel({productName, description, productCategory, price, quantity, model, color, weight})
      product.save()

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
}

module.exports = ProductController