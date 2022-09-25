let mongoose = require("mongoose")

let userSchema = new mongoose.Schema({
    nom:{type: String,required: true,minLength:3},
    prenom:{type: String,required: true,minLength:3},
    email:{type: String,},
    tel:{type: String,required: true,minLength:3,unique:true},
    password:{type: String,required: true,minLength:3},
})

module.exports =  mongoose.model("User",userSchema);