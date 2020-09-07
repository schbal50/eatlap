const express = require('express');
const userRouter = express.Router();
const passport = require('passport');
const passportConfig = require('../passport');
const JWT = require('jsonwebtoken');
const User = require('../models/User');
const MenuItem = require('../models/Menu');

// REF : async await a routeoknál!! 
// REF : Az errorokat error middlewarera cserélni 
// REF : .env
const signToken = userID => {
    return JWT.sign({
        iss: "NoobCoder", // issuer - who issued this jwt token
        sub: userID // who is this token for
    }, "NoobCoder", { expiresIn: "1h" }) // it must be the same as in authorization secretOrKey so I have to implement it to the .env when refactor 
}

userRouter.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    User.findOne({$or: [{username},{email}]}, (err, user) => {
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
userRouter.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    if (req.isAuthenticated()) {
        const { _id, username, role } = req.user; // It comes from passport (comparePassword -> return callback ( null, this == which is the user)) 
        // user has signed in sofar
        const token = signToken(_id);
        res.cookie('access_token', token, { httpOnly: true, sameSite: true }); // httpOnly -> ez védi meg a xss-től Samesite: xrs től véd !! 
        res.status(200).json({ isAuthenticated: true, user: { username, role } });
    }
});

userRouter.get('/logout', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.clearCookie('access_token');
    res.json({ user: { username: "", role: "" }, success: true });
});

userRouter.post('/menuItem', passport.authenticate('jwt', { session: false }), (req, res) => {
    const menuItem = new MenuItem(req.body);
    menuItem.save(err => {
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

userRouter.get('/menu', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findById({ _id: req.user._id }).populate('menu').exec((err, document) => { // Populate miatt nem csak a primary keyeket teszi át, hanem hozzákapcsolja a rendes menu objektumokat.
        if (err) res.status(500).json({ message: { msgBody: "Error has occured", msgError: true } });
        else {
            res.status(200).json({ menu: document.menu, authenticated: true }); // authenticated a frontendnek, hogy jelezze h still logged in van
        }
    })
});

userRouter.get('/admin', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.role === "admin") {
        res.status(200).json({ message: { msgBody: "You are an admin", msgError: false } });
    }
    else res.status(403).json({ message: { msgBody: "You have no permission to this page.", msgError: false } });
});

// This is for mainly persistents for the client : Once the browser closed the state gets resets, so this endpoint is to be synced the back and frontend  
userRouter.get('/authenticated', passport.authenticate('jwt', { session: false }), (req, res) => {
    const {username, role} = req.user;
    res.status(200).json({isAuthenticated : true, user : { username, role }});
});

module.exports = userRouter;