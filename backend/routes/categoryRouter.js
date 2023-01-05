const express = require('express')
const router = express.Router()
const Category = require('../controllers/categoryController')
const {createCategory, getCategory, getCategoryByID, updateCategory} = new Category()
const auth = require('../middleware/authentication')

router.post('/', createCategory)
router.get('/', auth, getCategory)
router.get('/:id', getCategoryByID)
router.put('/:id', updateCategory)




module.exports = router