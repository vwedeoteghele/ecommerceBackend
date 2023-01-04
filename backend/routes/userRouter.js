const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const { registerUser} = new UserController()


router.post('/register', registerUser)
// router.post('/login', )

module.exports = router