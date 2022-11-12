let mongoose = require("mongoose")

let partnerSchema = new mongoose.Schema({
    username:{type: String,minLength:5,unique:true,required:true},
    password:{type: String,minLength:5,required:true},
})

module.exports =  mongoose.model("Partner",partnerSchema);