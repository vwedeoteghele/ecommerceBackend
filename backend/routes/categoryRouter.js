const express = require('express')
const router = express.Router()
const Category = require('../controllers/categoryController')
const {createCategory, getCategory, getCategoryByID, updateCategory} = new Category()

router.post('/', createCategory)
router.get('/', getCategory)
router.get('/:id', getCategoryByID)
router.put('/:id', updateCategory)




module.exports = router