let express = require("express");
let router = express.Router();
let Event = require("../database/models/event.js");
let Commande = require("../database/models/commande.js");
let Tmpcommande = require("../database/models/tmpCommande.js");

let ImageKi = require("imagekit");

let ImageKit = new ImageKi({
  publicKey: "public_xGsp4GcRJJjwYluoGenupRC2gy4=",
  privateKey: "private_sc+xzMyqqKwiwRuTHpQN2YKDSj0=",
  urlEndpoint: "https://ik.imagekit.io/g8k0fkvg9/",
});
// connection to database
let connection = require("../database/connection.js");
let conn = connection();

// get events available for scanning
// au moins un jour avant le spectacle et 5h apres
router.get("/getScanEvents", async (req, res) => {
    try {
      let event = []
      let allEvents = await Event.find();
      let currentDate = new Date().getTime()
      allEvents.forEach(evt=>{
        evtDate = new Date(evt.date).getTime()
        if(
            currentDate > evtDate - 24 * 60 * 60 * 1000 &&
            currentDate < evtDate + 5 * 60 * 60 * 1000
          ) // au moins un jour avant le spectacle et 5h apres
        {
          let copy = JSON.parse(JSON.stringify(evt));
          copy.gmtDate = currentDate
          event.push(copy)
        }  
      })
      res
        .status(200)
        .json({
          success: true,
          message: "Successfuly get events list",
          result: event,
        });
    } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message });
    }
  });

  // Commande delete when scannning
router.post("/deleteCommande", async (req, res) => {
  const session = await conn.startSession();
  try {
    session.startTransaction();
    //
    let cmmde = await Tmpcommande.findOneAndDelete({_id: req.body.commandeId,eventId: req.body.eventId},{session});
    if (cmmde) 
    {
      try{
          await ImageKit.deleteFile(cmmde.fileId);
        }catch(e){console.log(e.message)}
      //
      res
        .status(200)
        .json({ success: true, message: "Successfuly check the ticket",categorie:cmmde.type });
    } else {
      res
        .status(200)
        .json({
          success: false,
          message:
            "Cet ticket ne correspond à aucune commande (ticket déjà utiliser)"
        });
    }
    //
      await session.commitTransaction();
      session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.json({ success: false, message: error.message });
  }
});

module.exports = router