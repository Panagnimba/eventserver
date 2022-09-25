let mongoose = require("mongoose")

let adminSchema = new mongoose.Schema({
    username:{type: String,minLength:5,unique:true},
    password:{type: String,minLength:5},
    role:{type:String}
})

module.exports =  mongoose.model("Admin",adminSchema);