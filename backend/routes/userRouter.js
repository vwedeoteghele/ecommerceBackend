const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const { registerUser, loginUser, verifyUser, requestPassword, resetPassword} = new UserController()


router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/verify/:userId/:uniqueString', verifyUser)
router.post('/requestPasswordReset', requestPassword)
router.post('/resetPassword', resetPassword)
module.exports = router