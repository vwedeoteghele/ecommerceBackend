const express = require('express')
const router = express.Router()
const ProductController = require("../controllers/productController")
const {createProduct, getProduct, getProductByID} = new ProductController()


/**
 * create product
 * get all product
 * get one product
 * update product product
 * delete product
 */

router.post("/", createProduct)
router.get("/", getProduct)
router.get("/:id", getProductByID)
module.exports = router;