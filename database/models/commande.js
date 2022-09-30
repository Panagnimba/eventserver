let mongoose = require("mongoose")

let commandeSchema = new mongoose.Schema({

    paymentMethod:{type: String,required: true},
    price:{type: Number,required: true},
    img:{type: String,required: true},
    intitule:{type: String,required: true},
    eventDate: {type:String,required:true},
    beneficiaireName:{type: String,},
    // 
    commandeDate:{type: Date,default: Date.now},
// QRCODE
    qrcode: {type:String,required:true,minLength:5},
    fileId: {type:String,required:true,minLength:5},
// CLIENT
    clientId:{type:mongoose.Schema.Types.ObjectId,required: true},
    clientTel:{type: String,required: true},
    clientPrenom:{type: String,},
   
})

module.exports =  mongoose.model("Commande",commandeSchema);