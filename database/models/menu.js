let mongoose = require("mongoose")

let menuSchema = new mongoose.Schema({
    name:{type: String,required: true,minLength:3},
    url:{type: String}
})

module.exports =  mongoose.model("Menu",menuSchema);