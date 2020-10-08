const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const valid = require('validator');

// REF : Add more information
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 6,
        max: 15,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!valid.isEmail(value)) {
                throw new Error("Email is invalid")
            }
        }
    },
    name: {
        type: String,
        max : [127, "Max Length is 127 characters"],
    },
    address: { // 
        type:String
    },
    phone_numers: {
        type: [String],
        default: undefined,
        validate(value) {
            if(!valid.isMobilePhone(value, any)){
                throw new Error("Phone number is invalid")
            }
        }
    },
    profile_logo: {
        type: Object,

    },
    is_staff: {
        type: Boolean,
        default: false
    },
    menu: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }]
}, {
    timestamps: true
});

// Before saving, it hashes the password
UserSchema.pre('save', function (next) {
    if (!this.isModified('password'))
        return next();
    bcrypt.hash(this.password, 10, (err, passwordHash) => {
        if (err) return next(err);
        this.password = passwordHash;
        next();
    });
});

UserSchema.methods.comparePassword = function (password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        if (err) return cb(err);
        if (!isMatch) return cb(null, isMatch);
        return cb(null, this) // this === user
    })
}

module.exports = mongoose.model('User',UserSchema)