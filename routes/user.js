let express = require("express")
let router = express.Router();
let Event = require("../database/models/event.js");
let Commande = require("../database/models/commande.js");

let connection = require("../database/connection.js")

// connection to database
let conn = connection();

router.post("/saveCommande",async (req,res)=>{
    // console.log(req.body)
    let ids= []
    let myCommande = {
        paymentMethod:req.body.paymentMethod,
        // 
        clientId:req.body.client._id,
        clientTel:req.body.client.tel,
        clientPremon:req.body.client.prenom
    }
    let commandes = req.body.items; // liste des evenements à commander
    const session = await conn.startSession();
    try{
        session.startTransaction();    
        // 
        for(i=0;i<commandes.length;i++)
        {
            let evnt = await Event.findOne({_id:commandes[i]._id},{intitule:1,img:1,date:1,prices:1})
            if(evnt != null){
                let prixItem = evnt.prices.filter(prix=>prix.type == commandes[i].type)
                let prix = prixItem[0].price
                console.log(prix)
                // 
                myCommande.price = prix
                myCommande.img = evnt.img
                myCommande.intitule = evnt.intitule
                // 
                for(j=0;j<commandes[i].qte;j++){
                    if(commandes[i].useSameNameInfo)
                        myCommande.beneficiaireName = commandes[i].beneficiairesNames[0]
                        else
                        myCommande.beneficiaireName = commandes[i].beneficiairesNames[j]
                    //
                    let cmmde = new Commande(myCommande);
                    await cmmde.save()
                    ids.push(cmmde._id)
                }
            }
            else{
                await session.abortTransaction();
                res.json({ success: false, eventNonDispo:true,eventId:commandes[i]._id,message: "Evènement de commande non disponible"});
                break
            }
        }
        //   
        await session.commitTransaction();
        console.log(ids)
        res.json({ success: true, message: "Commande enregistrée \n Vous pouvez consulter vos tickets sur votre profile" });
    }catch (error) 
    {
        console.log(error);
        await session.abortTransaction();
        res.json({ success: false, message: error.message });
      }
    //   
      session.endSession();
})

module.exports = router