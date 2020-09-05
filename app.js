// REF : Add helmet and morgan for protection
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")

app.use(cookieParser())
app.use(express.json())

// REF : .env & kiszervezni külön fileba & Atlas szervert kellene használni
mongoose.connect("mongodb://localhost:27017/mernauth", { useNewUrlParser: true, useUnifiedTopology: true }, () => {
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