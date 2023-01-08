const User = require('../models/userModel')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserVerification = require('../models/userVerification')
const {v4: uuidv4} = require('uuid')
require('dotenv').config()
const path = require('path')
const transporter = require('../utils/emailTransporterUtils')


class UserController {
  //reset password
  //email verification
  //social login
  //birthday message

  async sendVerificationMail({email, _id}) {
    try {
      
      const verificationUrl = "http://localhost:5000"
      const uniqueString = uuidv4() + _id

      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify your email",
        html:  `<p>Verify your email address to complete the signup and login into your account</p><p>This link <b>expires in 6 hours</b></p><p>Press <a href=${verificationUrl + "/user/verify/" + _id + "/" + uniqueString}>Here</a> to proceed</p>`
      }

      const hashedString = await bcrypt.hash(uniqueString, 10)

      const userVerification = new UserVerification({
        userId: _id,
        uniqueString: hashedString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000
      })

      userVerification.save()

      await transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.log(error);
      res.status(400)
      .json({
        status: "FAILED",
        message: "Something went wrong"
      })
    }
  }

  async registerUser(req, res) {
    
    try {
      const {firstName, lastName, email, password} = req.body
      if(!(email && password && firstName && lastName)) {
        res.status(400).send("All input is required");
      }

      const oldUser = await User.findOne({email: email.toLowerCase().trim()})
      if(oldUser) {
        return res.status(409).send('user already exists, Please login')
      }

      const encryptedPassword = await bcrypt.hash(password, 10)
      const user = new User({
        firstName,
        lastName,
        email: email.toLowerCase().trim(),
        password: encryptedPassword
      })

      await user.save()

      const sendEmailToVerify = await this.sendVerificationMail(user)
      if(sendEmailToVerify) {
        res.status(200).json({
          status: "PENDING",
          message: "verification mail sent"
        })
      } else {
        res.status(400).json({
          status: "FAILED",
          message: "Error Occurred!"
        })
      }

      // const token = jwt.sign(
      //   {
      //     user_id: user._id,
      //     email
      //   },
      //   process.env.TOKEN_KEY,
      //   {
      //     expiresIn: "2h"
      //   }
      // )

      // user.token = token
      // res.status(201).json(user)

    } catch (error) {
      console.log(error);
      res.status(400)
      .json({
        status: "FAILED",
        message: "Something went wrong"
      })
    }


  }

  async verifyUser(req, res) {
    try {
      const {userId, uniqueString} = req.params
      const userVerificationExists = await UserVerification.findOne({userId})

      if(!userVerificationExists) {
        res.status(400)
        .json({
          status: "FAILED",
          message: "Something went wrong"
        })
      }

      await UserVerification.deleteMany({userId})
      
      const userUpdate = await User.updateOne({_id: userId}, {verified: true})
      if(userUpdate) {
        res.sendFile(path.join(__dirname, './../views/verified.html'))
      } else {
        res.sendFile(path.join(__dirname, './../views/notVerified.html'));
      }
      
    } catch (error) {
      console.log(error);
      res.status(400)
      .json({
        status: "FAILED",
        message: "Something went wrong"
      })
    }
  }

  async loginUser(req, res, next) {

    try {
      
      const {email, password} = req.body
      if(!(email && password)) {
        return res.status(400).send("email and passowrd are required")

      }

      //check if the user exist
      const userExists = await User.findOne({email: email.toLowerCase().trim()})

      if(!userExists) {
        return res.status(400).send("provide correct email and password")
      }

      //if user exists in db, compare password in db with input password
      const match = await bcrypt.compare(password, userExists.password)
      if(!match) {
        return res.status(400).send("provide correct email and password")
      }

      //if email and password are correct, create a signed token for the user
      const token = jwt.sign({
        user_id: userExists._id,
        email
      }, process.env.TOKEN_KEY , { expiresIn: '2h' });

      userExists.token = token
      res.status(201).json(userExists)

    } catch (error) {
      next(error)
    }

  }
}

module.exports = UserController