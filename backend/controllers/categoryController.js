const CategoryModel = require('../models/categoryModel')

class Category {

  async createCategory(req, res, next) {
    const {categoryName, featured, image, tags} = req.body

    try {
      if(!categoryName) {
        return res.status(400).send("Please provide the category name")
      }

      const category = new CategoryModel({categoryName, featured, tags, image})
      category = await category.save()
      res.status(200).json(category)
    } catch (error) {
      next(error)
    }
  }

  async getCategory(req, res, next) {
    try {
      
      const category = await CategoryModel.find()
      res.status(200).json(category)
    } catch (error) {
      next(error)
    }
  }

  async getCategoryByID(req, res, next) {
    try {
      const categoryID = req.params.id
      const category = await CategoryModel.findById(categoryID)
      if(!category) {
        return res.status(400).send("There are no product to display")      
      }

      res.status(200).json(category)
    } catch (error) {
      next(error)
    }
  }

  async updateCategory(req, res, next) {
    try {
      const categoryID = req.params.id
      const categoryToUpdate = await CategoryModel.findById(categoryID)

      if(!categoryToUpdate) {
        return res.status(400).send("There are no category with this ID")  
      }
      const updateCategory = CategoryModel.findByIdAndUpdate(categoryID, req.body, {new: true})
    } catch (error) {
      next(error)
    }
  }

}

module.exports = Category