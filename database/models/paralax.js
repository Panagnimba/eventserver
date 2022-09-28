let mongoose = require("mongoose")

let paralaxSchema = new mongoose.Schema({
    bgImage:{type: String},
    fileId: {type:String,minLength:5},
    textContent:{type: String}
})

module.exports =  mongoose.model("Paralax",paralaxSchema);