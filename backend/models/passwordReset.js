const mongoose = require('mongoose')

const resetPasswordSchema = new mongoose.Schema({
  userId: String,
  resetString: String,
  createdAt: Date,
  expiresAt: Date
})

const ResetPassword = mongoose.model('resetPassword', resetPasswordSchema)

module.exports = ResetPassword