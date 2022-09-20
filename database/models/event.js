let mongoose = require("mongoose")

let eventSchema = new mongoose.Schema({

        img: {type:String,required:true,minLength:5},
        fileId: {type:String,required:true,minLength:5},
        categorie: {type:String,required:true},
        intitule: {type:String,required:true},
        artiste: {type:String,required:true},
        date: {type:String,required:true},
        openTime: {type:String},
        lieu: {type:String,required:true},
        description:{type:String},
        prices: [
          {
            type: {type:String,required:true},
            price: {type:Number,required:true},
          },
        ],
        // 
        publishDate:{type: Date,default: Date.now}
})

module.exports =  mongoose.model("Event",eventSchema);