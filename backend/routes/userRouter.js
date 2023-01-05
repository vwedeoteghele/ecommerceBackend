const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const { registerUser, loginUser} = new UserController()


router.post('/register', registerUser)
router.post('/login', loginUser)

module.exports = router