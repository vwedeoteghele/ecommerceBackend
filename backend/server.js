const express = require("express");
const color = require("colors")
const dotenv = require("dotenv").config();
const connectDB = require("../backend/config/db")
const port = process.env.PORT || 5000;
const {errorHandler} = require("./middleware/errorHandler")

const productRouter = require('./routes/productRouter.js')
const categoryRouter = require('./routes/categoryRouter.js')
const reviewRouter = require('./routes/reviewRouter')

connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/product', productRouter)
app.use('/category', categoryRouter)
// app.use('/review', reviewRouter)

app.use(errorHandler);


app.listen(port, () => console.log(`Server running on port ${port}`))