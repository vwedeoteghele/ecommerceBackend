const jwt = require("jsonwebtoken")

const auth = async(req, res, next) => {
  try {

    const token = req.header('authorization').split(' ')[1]
    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }
    const validToken =  jwt.verify(token, process.env.TOKEN_KEY)
    req.user = validToken


  } catch (error) {
    return res.status(401).send("Invalid Token")
  }
  return next()
}

module.exports = auth