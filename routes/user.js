let express = require("express")
let router = express.Router();
let Event = require("../database/models/event.js");
let Commande = require("../database/models/commande.js");
let Tmpcommande = require("../database/models/tmpCommande.js");

// 
var QRCode = require('qrcode')

let ImageKi = require("imagekit");

let ImageKit = new ImageKi({
    publicKey : "public_xGsp4GcRJJjwYluoGenupRC2gy4=",
    privateKey : "private_sc+xzMyqqKwiwRuTHpQN2YKDSj0=",
    urlEndpoint : "https://ik.imagekit.io/g8k0fkvg9/Events"
});
// 
let connection = require("../database/connection.js");
const { default: mongoose } = require("mongoose");

// connection to database
let conn = connection();

router.post("/saveCommande",async (req,res)=>{
    // console.log(req.body)
    let myCommande = {
        paymentMethod:req.body.paymentMethod,
        // 
        clientId:req.body.client._id,
        clientTel:req.body.client.tel,
        clientPremon:req.body.client.prenom
    }
    let commandes = req.body.items; // liste des evenements à commander
    const session = await mongoose.startSession();
    try{
        session.startTransaction();    
        // 
        for(i=0;i<commandes.length;i++)
        {
            let evnt = await Event.findOne({_id:commandes[i]._id},{intitule:1,img:1,date:1,prices:1})
            myCommande.eventId = evnt._id;
            
            if(evnt != null){
                let prixItem = evnt.prices.filter(prix=>prix.type == commandes[i].type)
                let prix = prixItem[0].price

                // 
                myCommande.price = prix
                myCommande.img = evnt.img
                myCommande.intitule = evnt.intitule
                myCommande.eventDate = evnt.date
                // 
                for(j=0;j<commandes[i].qte;j++){
                    if(commandes[i].useSameNameInfo)
                        myCommande.beneficiaireName = commandes[i].beneficiairesNames[0]
                        else
                        myCommande.beneficiaireName = commandes[i].beneficiairesNames[j]
                    //
                    let cmmde =   new Commande(myCommande);
                    let idt_unik_cmmde =   cmmde._id;
                    // 
                    let qrcodeBase64 = await QRCode.toDataURL(`${idt_unik_cmmde}|${myCommande.eventId}`)
                    let response = await ImageKit.upload({file : qrcodeBase64,fileName : "commade_qr.png"});
                    // 
                    cmmde._id = idt_unik_cmmde;
                    myCommande.fileId = cmmde.fileId = response.fileId;
                    myCommande.qrcode = cmmde.qrcode = response.url;
                    // Collection temporarire des commandes
                    await cmmde.save({session}) // historique des commandes (jamais supprimé)
                    let tmpCmmde = new Tmpcommande(myCommande)
                    tmpCmmde._id = idt_unik_cmmde;
                    await tmpCmmde.save({session})
                }
            }
            else{
                // 
                throw { success: false, eventNonDispo:true,eventId:commandes[i]._id,message: "Evènement de commande non disponible"};   
            }
        }
        //   
        await session.commitTransaction();
        res.json({ success: true, message: "Commande enregistrée \n Vous pouvez consulter vos tickets sur votre profile" });
    }catch (error) 
    {
        console.log(error);
        await session.abortTransaction();
        //   
        session.endSession();
        res.json({ success: false, message: error.message });
      }
    //   
      session.endSession();
})
// 
router.get("/mesCommandes/:id",async(req,res)=>{
    try{
        let commandeList = await Tmpcommande.find({clientId:req.params.id});
        res.status(200).json({success:true,message:"Successfuly get commandes list",result:commandeList})
    }catch(error){
      console.log(error)
      res.json({success:false,message:error.message})
    }
  })
module.exports = router