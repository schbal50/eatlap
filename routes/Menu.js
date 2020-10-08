const express = require('express');
const menuRouter = express.Router();
const passport = require('passport');
const passportConfig = require('../passport');
const JWT = require('jsonwebtoken');
const User = require('../models/User');
const MenuItem = require('../models/Menu');

require('dotenv').config();

const signToken = userID => {
    return JWT.sign({
        iss: process.env.SIGN_TOKEN_ISSUER, // issuer - who issued this jwt token
        sub: userID // who is this token for
    }, process.env.SIGN_TOKEN_ISSUER, { expiresIn: "1h" }) // it must be the same as in authorization secretOrKey so I have to implement it to the .env when refactor 
}

menuRouter.get("/:id", (req, res) => {
    const _id = req.params.id
    console.log(_id)
    User.findById({ _id: _id }).populate('menu').exec((err, document) => { // Populate miatt nem csak a primary keyeket teszi át, hanem hozzákapcsolja a rendes menu objektumokat.
        if (err) res.status(404).json({ message: { msgBody: "Error has occured", msgError: true } });
        else {
            res.status(200).json({ menu: document.menu });
        }
    })
})


module.exports = menuRouter;