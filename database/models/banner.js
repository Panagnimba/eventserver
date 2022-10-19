let mongoose = require("mongoose")

let bannerSchema = new mongoose.Schema({
    bgImage: {type:String,required:true,minLength:5},
    fileId: {type:String,required:true,minLength:5},
    items: [
      {
        order: {type:Number},
        title: {type:String},
        img: {type:String,required:true,minLength:5},
        fileId: {type:String,required:true,minLength:5},
      }
    ]
})

module.exports =  mongoose.model("Banner",bannerSchema);