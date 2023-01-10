const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS
  }
})

transporter.verify((error, success) => {
  if(error) {
    console.log(error);
  } else {
    console.log("mail service is ready")
    console.log(success)
  }
})

module.exports = transporter