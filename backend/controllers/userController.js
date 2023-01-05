const User = require('../models/userModel')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


class UserController {

  async registerUser(req, res, next) {
    
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

      const token = jwt.sign(
        {
          user_id: user._id,
          email
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h"
        }
      )

      user.token = token
      res.status(201).json(user)

    } catch (error) {
      next(error)
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