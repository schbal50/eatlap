const mongoose = require("mongoose");

// REF : add more information about the menu
const menuSchema = new mongoose.Schema({
    name : {
        type : String, 
        required: true
    }
})

module.exports = mongoose.model('MenuItem',menuSchema)