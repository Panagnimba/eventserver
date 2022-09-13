let mongoose = require("mongoose")

let bannerSchema = new mongoose.Schema({
    bgImage: {type:String,required:true,minLength:5},
    items: [
      {
        order: {type:Number},
        img: {type:String,required:true,minLength:5},
        title: {type:String},
      }
    ]
})

module.exports =  mongoose.model("Banner",bannerSchema);