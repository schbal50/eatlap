const express = require('express');
const userRouter = express.Router();
const passport = require('passport');
const passportConfig = require('../passport');
const JWT = require('jsonwebtoken');
const User = require('../models/User');
const MenuItem = require('../models/Menu');
require('dotenv').config();
const mongodb = require('mongodb')
const ObjectID = mongodb.ObjectID


// REF : async await a routeoknál!! 
// REF : Az errorokat error middlewarera cserélni 
// REF : .env
const signToken = userID => {
    return JWT.sign({
        iss: process.env.SIGN_TOKEN_ISSUER, // issuer - who issued this jwt token
        sub: userID // who is this token for
    }, process.env.SIGN_TOKEN_ISSUER, { expiresIn: "1h" }) // it must be the same as in authorization secretOrKey so I have to implement it to the .env when refactor 
}

userRouter.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    await User.findOne({ $or: [{ username }, { email }] }, (err, user) => {
        if (err) res.status(500).json({ message: { msgBody: "Error has occured", msgError: true } });
        if (user) res.status(400).json({ message: { msgBody: "Username or email is already in use.", msgError: true } });
        else {
            const newUser = new User({ username, password, email });
            newUser.save(err => {
                if (err) res.status(500).json({ message: { msgBody: "Error has occured", msgError: true } });
                else res.status(201).json({ message: { msgBody: "Account successfully created", msgError: false } });
            })
        }
    })
});

// session: false = server is not maintaining the session
userRouter.post('/login', passport.authenticate('local', { session: false }), async (req, res) => {
    if (await req.isAuthenticated()) {
        const { _id, username, is_staff } = req.user; // It comes from passport (comparePassword -> return callback ( null, this == which is the user)) 
        // user has signed in sofar
        const token = signToken(_id);
        res.cookie('access_token', token, { httpOnly: true, sameSite: true }); // httpOnly -> ez védi meg a xss-től Samesite: xrs től véd !! 
        res.status(200).json({ isAuthenticated: true, user: { username, is_staff } });
    }
});

userRouter.get('/logout', passport.authenticate('jwt', { session: false }), async (req, res) => {
    res.clearCookie('access_token');
    res.json({ user: { username: "", is_staff: false }, success: true });
});

// REF7 - USER CRUDES
// USER DATA: username, email, password, is_staff, menu
// profile_logo, address, phone_numbes, name

userRouter.post('/menuItem', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const menuItem = new MenuItem(req.body);
    await menuItem.save(err => {
        if (err) res.status(500).json({ message: { msgBody: "Error has occured", msgError: true } });
        else {
            req.user.menu.push(menuItem);
            req.user.save(err => {
                if (err) res.status(500).json({ message: { msgBody: "Error has occured", msgError: true } });
                else res.status(200).json({ message: { msgBody: "Successfully added menu", msgError: false } });
            });
        }
    })
});

userRouter.get('/menu', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await User.findById({ _id: req.user._id }).populate('menu').exec((err, document) => { // Populate miatt nem csak a primary keyeket teszi át, hanem hozzákapcsolja a rendes menu objektumokat.
        if (err) res.status(500).json({ message: { msgBody: "Error has occured", msgError: true } });
        else {
            res.status(200).json({ menu: document.menu, authenticated: true }); // authenticated a frontendnek, hogy jelezze h still logged in van
        }
    })
});

userRouter.delete('/deleteMenuItem/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const menuItemId = req.params.id
    await User.findById({ _id: req.user._id }).populate('menu').exec((err, document) => {
        if (err) res.status(500).json({ message: { msgBody: "Error has occured", msgError: true } });
        else {
            // let id = new ObjectID(menuItemId)
            const found = document.menu.find(itm => String(itm._id) === menuItemId) // asszem átkell alakitani obj-re
            if (found) {
                const filteredUserMenuArray = req.user.menu.filter(itm => String(itm) === menuItemId)
                try {
                    User.findByIdAndUpdate({ _id: req.user._id }, { menu: filteredUserMenuArray }, { runValidators: true })
                    MenuItem.findByIdAndDelete({ _id: menuItemId }, (err, doc) => {
                        if (err) res.status(500).json({ message: { msgBody: "Error has occured", msgError: true } });
                        else {
                            const filteredPopulatedMenu = document.menu.filter(itm => String(itm._id) !== menuItemId)
                            res.status(200).json({ menu: filteredPopulatedMenu, authenticated: true, message: { msgBody: "Successfully deleted menu item", msgError: false } });
                        }
                    })
                } catch (error) {
                    res.status(500).json({ message: { msgBody: "Error has occured", msgError: true } });
                }
            } else {
                res.status(500).json({ message: { msgBody: "Error has occured", msgError: true } });
            }
        }
    })
})

userRouter.patch('/updateItem/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const element = req.user.menu.find(item => String(item._id) === req.params.id)
    if (element) {
        try {

            await MenuItem.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, useFindAndModify: false }).then((doc) => {
                if (!doc) res.status(404).json({ message: { msgBody: "Item not found", msgError: true } });
                else {res.status(200).json({ message: { msgBody: "Successfully added menu", msgError: false } });
                console.log(doc);
            }
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: { msgBody: "Error has occured", msgError: true } });
        }
    }
    else {
        res.status(401).json({ message: { msgBody: "Error has occured", msgError: true } });
    }

})

userRouter.get('/admin', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.is_staff) {
        res.status(200).json({ message: { msgBody: "You are an admin", msgError: false } });
    }
    else res.status(403).json({ message: { msgBody: "You have no permission to this page.", msgError: false } });
});

// This is for mainly persistents for the client : Once the browser closed the state gets resets, so this endpoint is to be synced the back and frontend  
userRouter.get('/authenticated', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { username, is_staff } = req.user;
    res.status(200).json({ isAuthenticated: true, user: { username, is_staff } });
});

// https://blog.risingstack.com/mastering-async-await-in-nodejs/
process.on('unhandledRejection', (err) => { 
    console.error(err);
    process.exit(1);
})

module.exports = userRouter;