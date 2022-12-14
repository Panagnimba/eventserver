let express = require("express");
let bcrypt = require("bcrypt");

let router = express.Router();
let connection = require("../database/connection.js");
let Menu = require("../database/models/menu.js");
let Banner = require("../database/models/banner.js");
let Event = require("../database/models/event.js");
let Paralax = require("../database/models/paralax.js");
let Admin = require("../database/models/admin.js");
let User = require("../database/models/user.js");
let Commande = require("../database/models/commande.js");
let Tmpcommande = require("../database/models/tmpCommande.js");
// 
let Partner = require("../database/models/partner.js");

// for file upload//  let ImageKit = require("../imagekit/imagekit.js");

let ImageKi = require("imagekit");

let ImageKit = new ImageKi({
  publicKey: "public_xGsp4GcRJJjwYluoGenupRC2gy4=",
  privateKey: "private_sc+xzMyqqKwiwRuTHpQN2YKDSj0=",
  urlEndpoint: "https://ik.imagekit.io/g8k0fkvg9/",
});

// connection to database
let conn = connection();
// Ajout et update handle des menus
router.post("/newMenu", async (req, res) => {
  try {
    if (req.body._id == null || req.body._id == undefined) {
      let menu = new Menu({ name: req.body.name, url: req.body.url });
      await menu.save();
      res
        .status(200)
        .json({ success: true, message: "Menu ajouter avec succès" });
    } else {
      await Menu.updateOne(
        { _id: req.body._id },
        { name: req.body.name, url: req.body.url }
      );
      res.json({ success: true, message: "Menu modifier avec succès" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});

router.get("/getMenus", async (req, res) => {
  try {
    let menus = await Menu.find();

    res
      .status(200)
      .json({
        success: true,
        message: "Successfuly get list of menus",
        result: menus,
      });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});

router.post("/deleteMenu", async (req, res) => {
  try {
    await Menu.deleteOne({ _id: req.body.id });
    res
      .status(200)
      .json({ success: true, message: "Menu supprimé avec succès" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});

//---------- Banner ---------------------//
router.post("/saveBanner", async (req, res) => {
  let data = req.body;
  const session = await conn.startSession();
  let fileIds = []
  try {
      session.startTransaction();
    // ---------- background image saving on the server--------------
      if (data.bgImage.includes("data:image")) 
      {
            try {
              if (data.fileId) await ImageKit.deleteFile(data.fileId);
              // 
              let response = await ImageKit.upload({
                file: data.bgImage,
                fileName: "banner_bg.png",
              });
              data.bgImage = response.url;
              data.fileId = response.fileId;
                // fileIds qui sera utiliser pour supprimer l'image 
                // en cas d'erreur
                fileIds.push(response.fileId)
            } catch (e) {
              console.log(e.message);
            }
          
      }
    // ---------- Items images saving on the server -----------------
    let mybanner = await Banner.findOne();
    let itemsSize = data.items.length;
    if (mybanner)
    {
      itemsSize =
        data.items.length > mybanner.items.length
          ? data.items.length
          : mybanner.items.length;
    }
    for (i = 0; i < itemsSize; i++) {
      if (i < data.items.length) {
        if (data.items[i].img.includes("data:image")) 
        {
              let response = await ImageKit.upload({
                file: data.items[i].img,
                fileName: "banner_item.png",
              });
              data.items[i].img = response.url;
              data.items[i].fileId = response.fileId;
              // fileIds qui sera utiliser pour supprimer l'image 
              // en cas d'erreur
              fileIds.push(response.fileId)
          try {
            if (mybanner && (i < mybanner.items.length) && mybanner.items[i].fileId) {
                await ImageKit.deleteFile(mybanner.items[i].fileId);
            }
          } catch (e) {
            console.log(e.message);
          }
        }
      } else if (mybanner) {
        try {
          if (mybanner.items[i].fileId)
            await ImageKit.deleteFile(mybanner.items[i].fileId);
        } catch (e) {
          console.log(e.message);
        }
      }
    }
    // ----------- Now store data to the database----------
    //------------ Contening image path store in server----
    if (data._id == null || data._id == undefined) {
      let banner = new Banner(data);
      await banner.save({session});
      res
        .status(200)
        .json({ success: true, message: "Slider Créer avec succès" });
    } else {
      await Banner.updateOne(
        { _id: data._id },
        { bgImage: data.bgImage, items: data.items }
      );
      res.json({ success: true, message: "Mise à jour du slider réussie" });
    }
     //
     await session.commitTransaction();
     session.endSession();

  } catch (error) {
    console.log(error.message);
    await session.abortTransaction();
        // 
            // delete file
            try{
              await ImageKit.bulkDeleteFiles(fileIds);
            }catch(e){console.log(e.message)}
        //         
        session.endSession();
    res.json({ success: false, message: error.message });
  }
});

router.get("/getBanner", async (req, res) => {
  try {
    let banner = await Banner.findOne();

    res
      .status(200)
      .json({
        success: true,
        message: "Successfuly get Slider items",
        result: banner,
      });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});

//---------- Event ---------------------//

router.post("/saveNewEvent", async (req, res) => {
  let data = req.body;
  try {
    // ---------- image saving on the server--------------
    if (data.img.includes("data:image")) {
      let response = await ImageKit.upload({file: data.img,fileName: "event.png",folder:'/Events'});
      data.img = response.url;
      data.fileId = response.fileId;
    }

    if (data._id == null || data._id == undefined) {
      let myEvent = new Event(data);
      await myEvent.save();
      res
        .status(200)
        .json({ success: true, message: "Evènement Créé avec succès" });
    } else {
      await Event.updateOne({ _id: data._id }, data);
      res.json({ success: true, message: "Evenement modifier avec succès" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});

// get all events without any condition
router.get("/getEvents", async (req, res) => {
  try {
    let event = await Event.find();

    res
      .status(200)
      .json({
        success: true,
        message: "Successfuly get events list",
        result: event,
      });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});
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

router.post("/deleteEvent", async (req, res) => {
  try {
    let evnt = await Event.findOneAndDelete({ _id: req.body.id });
    if (evnt)
    {
        try{
          await ImageKit.deleteFile(evnt.fileId); 
        }catch(e){console.log(e.message)}
    }
    res
      .status(200)
      .json({ success: true, message: "Evènement supprimé avec succès" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
});

// Paralax
router.post("/saveParalax", async (req, res) => {
  let data = req.body;
  try {
    // ---------- background image saving on the server--------------
    if (data.bgImage.includes("data:image"))
     {
        try {
          await ImageKit.deleteFile(data.fileId);
        } catch (err) {console.log(err.message);}
      //
        let response = await ImageKit.upload({
          file: data.bgImage,
          fileName: "paralax_bg.png",
        });
        data.bgImage = response.url;
        data.fileId = response.fileId;
    }

    // ----------- Now store data to the database----------
    //------------ Contening image path store in server----
    if (data._id == null || data._id == undefined) {
      let paralax = new Paralax(data);
      await paralax.save();
      res
        .status(200)
        .json({ success: true, message: "Paralax Créer avec succès" });
    } else {
      await Paralax.updateOne(
        { _id: data._id },
        {
          bgImage: data.bgImage,
          fileId: data.fileId,
          textContent: data.textContent,
        }
      );
      res.json({ success: true, message: "Mise à jour du paralax réussie" });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
});
router.get("/getParalax", async (req, res) => {
  try {
    let paralax = await Paralax.findOne();

    res
      .status(200)
      .json({
        success: true,
        message: "Successfuly get paralax",
        result: paralax,
      });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});


// 
router.post("/createNewPartner", async (req, res) => {
  try {
    //
    let partner = new Partner({
      username: req.body.username,
    });
    // password will be Mongoose.ObjectId@PartnerPassword
    partner.password = `${partner._id}@${req.body.password}`,
    await partner.save();
    res
      .status(200)
      .json({ success: true, message: "Nouveau partenaire créer avec succès" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
// get all partners 
router.get("/getPartners", async (req, res) => {
  try {
    let partners = await Partner.find();

    res
      .status(200)
      .json({
        success: true,
        message: "Successfuly get partners list",
        result: partners,
      });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
// delete partner
router.post("/deletePartner", async (req, res) => {
  try {
       await Partner.findOneAndDelete({ _id: req.body.id });
    res
      .status(200)
      .json({ success: true, message: "Partenaire supprimé avec succès" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
// --------------------ADMIN-------------------------------------
router.post("/createNewAdmin", async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    //
    let admin = new Admin({
      username: req.body.username,
      password: hash,
      role: req.body.role,
    });
    await admin.save();
    res
      .status(200)
      .json({ success: true, message: "Administrateur créer avec succès" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});
// get all admins
router.get("/getAdmins", async (req, res) => {
  try {
    let admins = await Admin.find();

    res
      .status(200)
      .json({
        success: true,
        message: "Successfuly get admins list",
        result: admins,
      });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
// delete admin
router.post("/deleteAdmin", async (req, res) => {
  try {
       await Admin.findOneAndDelete({ _id: req.body.id });
    res
      .status(200)
      .json({ success: true, message: "Administrateur supprimé avec succès" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
// ---------------------USERS------------------------------------------
// get all users
router.get("/getUsers", async (req, res) => {
  try {
    let users = await User.find();

    res
      .status(200)
      .json({
        success: true,
        message: "Successfuly get users list",
        result: users,
      });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
// delete admin
router.post("/deleteUser", async (req, res) => {
  try {
       await User.findOneAndDelete({ _id: req.body.id });
    res
      .status(200)
      .json({ success: true, message: "Utilisateur supprimé avec succès" });
  } catch (error) {
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

module.exports = router;
