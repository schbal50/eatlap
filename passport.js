const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const User = require('./models/User')
require('dotenv').config();

const cookieExtractor = req => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies["access_token"];
    }
    return token;
}

// authorizatin: use it whenever we wanna protect users things (like adding menu)
passport.use(new JwtStrategy({
    jwtFromRequest : cookieExtractor,
    secretOrKey: process.env.SIGN_TOKEN_ISSUER
}, (payload, done) => {
    User.findById({_id : payload.sub},(err,user)=> {
        if (err) return done(err, false);
        if (user) return done(null, user);
        else return done(null, false)
    })
}))

// authentication loacl strategy using username and pw (login)
passport.use(new LocalStrategy((username, password, done)=> {
    User.findOne({username}, (err, user) => {
        if(err) return done(err); // something went wrong with DB
        if(!user) return done(null, false); // if no user exists
        user.comparePassword(password, done); // check if pw is correct
    })
}))