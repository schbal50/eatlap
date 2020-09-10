// REF : Add helmet and morgan for protection
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const helmet = require('helmet') // backend sec
const morgan = require('morgan');

app.use(cookieParser())
app.use(express.json())
app.use(helmet());
app.use(morgan('common'))

// REF : .env & kiszervezni külön fileba & Atlas szervert kellene használni
mongoose.connect("mongodb+srv://schbal:W4T17ICGIE1ma2xS@eatlap.ogirp.mongodb.net/eatlap?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, () => {
    console.log("Successfully connected to database");
});

const userRouter = require('./routes/User');
app.use('/user', userRouter);
const menuRouter = require('./routes/Menu');
app.use('/menu', menuRouter);


//Server start 

// REF : .env -be szervevzni 
PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log("Server is running")
});