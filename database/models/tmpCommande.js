let mongoose = require("mongoose")

let tmpcommandeSchema = new mongoose.Schema({
    _id:{type:mongoose.Schema.Types.ObjectId,required: true},
    paymentMethod:{type: String,required: true},
    price:{type: Number,required: true},
    type:{type: String,required: true},// categorie: normal couple VIP
    img:{type: String,required: true},
    intitule:{type: String,required: true},
    eventId:{type:mongoose.Schema.Types.ObjectId,required: true},
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

module.exports =  mongoose.model("Tmpcommande",tmpcommandeSchema); 