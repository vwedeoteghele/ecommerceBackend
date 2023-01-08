const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const { registerUser, loginUser, verifyUser} = new UserController()


router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/verify/:userId/:uniqueString', verifyUser)
module.exports = router