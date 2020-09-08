const mongoose = require("mongoose");
const valid = require('validator');

// REF : add more information about the menu
const menuSchema = new mongoose.Schema({
    name : {
        type : String, 
        required: true
    },
    description : {
        type: String
    },
    price : {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0 ) { throw new Error('Price must be a positive number!')}
        }
    },
    categories : {
        type: [String],
        default: undefined
    }
})

module.exports = mongoose.model('MenuItem',menuSchema)