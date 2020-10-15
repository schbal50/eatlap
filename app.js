const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const helmet = require('helmet') // backend sec
const morgan = require('morgan');
require('dotenv').config();

app.use(cookieParser())
app.use(express.json())
//app.use(helmet());
app.use(morgan('common'))

mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, () => {
    console.log("Successfully connected to database");
});

const userRouter = require('./routes/User');
app.use('/user', userRouter);
const menuRouter = require('./routes/Menu');
app.use('/menu', menuRouter);

//Server start 

PORT = process.env.PORT

app.listen(PORT, () => {
    console.log("Server is running")
});