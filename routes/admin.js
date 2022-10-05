let express = require("express")
let fs = require("fs")
let router = express.Router();
let connection = require("../database/connection.js")
let Menu = require("../database/models/menu.js")
let Banner = require("../database/models/banner.js")
let Event = require("../database/models/event.js");
let Paralax = require("../database/models/paralax.js");
let Commande = require("../database/models/commande.js");

// for file upload//  let ImageKit = require("../imagekit/imagekit.js"); 

let ImageKi = require("imagekit");

let ImageKit = new ImageKi({
    publicKey : "public_xGsp4GcRJJjwYluoGenupRC2gy4=",
    privateKey : "private_sc+xzMyqqKwiwRuTHpQN2YKDSj0=",
    urlEndpoint : "https://ik.imagekit.io/g8k0fkvg9/Events"
});


// connection to database
let conn = connection();
// Ajout et update handle des menus
router.post("/newMenu",async(req,res)=>{
    try{
      if(req.body._id==null || req.body._id==undefined)
      {
        let menu = new Menu({name:req.body.name,url:req.body.url})
        await menu.save()
        res.status(200).json({success:true,message:"Menu ajouter avec succès"})
      }
      else
      {
        await Menu.updateOne({_id:req.body._id},{name:req.body.name,url:req.body.url})
        res.json({success:true,message:"Menu modifier avec succès"})
      }
    }catch(error){
      console.log(error)
      res.json({success:false,message:error.message})
    }
  })


router.get("/getMenus",async(req,res)=>{
    try{
        let menus = await Menu.find();
      
        res.status(200).json({success:true,message:"Successfuly get list of menus",result:menus})
     
    }catch(error){
      console.log(error)
      res.json({success:false,message:error.message})
    }
  })

router.post("/deleteMenu",async(req,res)=>{
    try{
      await Menu.deleteOne({_id:req.body.id})
      res.status(200).json({success:true,message:"Menu supprimé avec succès"})
    }catch(error){
      console.log(error)
      res.json({success:false,message:error.message})
    }
  })

//---------- Banner ---------------------//
router.post('/saveBanner',async(req,res)=>{
  let data = req.body
  try{
       // ---------- background image saving on the server--------------
       if(data.bgImage.includes('data:image')){
        let response = await ImageKit.upload({file : data.bgImage,fileName : "banner_bg.png"});
        data.bgImage = response.url
      }
      // ---------- Items images saving on the server -----------------
      for(i=0; i<data.items.length;i++){
        if(data.items[i].img.includes('data:image')){
          let response =  await ImageKit.upload({file : data.items[i].img,fileName : "banner_item.png"});
          data.items[i].img = response.url
        }
      } 
      // ----------- Now store data to the database----------
      //------------ Contening image path store in server----
      if(data._id==null || data._id==undefined)
      {
          let banner = new Banner(data)
          await banner.save()
          res.status(200).json({success:true,message:"Slider Créer avec succès"})
      }
      else
      {
   
        await Banner.updateOne({_id:data._id},{bgImage:data.bgImage,items:data.items})
        res.json({success:true,message:"Mise à jour du slider réussie"})
      }
  }catch(error){
    console.log(error.message)
    res.json({success:false,message:error.message})
  }
})

router.get("/getBanner",async (req,res)=>{
  try{
    let banner = await Banner.findOne();
  
    res.status(200).json({success:true,message:"Successfuly get Slider items",result:banner})
 
}catch(error){
  console.log(error)
  res.json({success:false,message:error.message})
}
})

//---------- Event ---------------------//

router.post("/saveNewEvent",async(req,res)=>{
  let data = req.body
  try{
          // ---------- image saving on the server--------------
          if(data.img.includes('data:image')){
            let response = await ImageKit.upload({file : data.img,fileName : "event.png"});
            data.img = response.url
            data.fileId = response.fileId
          }
      
          if(data._id==null || data._id==undefined){
            let myEvent = new Event(data);
            await myEvent.save()
            res.status(200).json({success:true,message:"Evènement Créé avec succès"})
        }
        else{
          await Event.updateOne({_id:data._id},data)
          res.json({success:true,message:"Evenement modifier avec succès"})
        }
    }
    catch(error){
      console.log(error)
      res.json({success:false,message:error.message})
    }
 
})

router.get("/getEvents",async(req,res)=>{
  try{
      let event = await Event.find();
    
      res.status(200).json({success:true,message:"Successfuly get events list",result:event})
   
  }catch(error){
    console.log(error)
    res.json({success:false,message:error.message})
  }
})

router.post("/deleteEvent",async(req,res)=>{
  let path = "./uploads/event"
  try{
    await Event.deleteOne({_id:req.body.id})
    let imgName = `${req.body.id}.png`
    fs.unlinkSync(`${path}/${imgName}`) //delete file 
    res.status(200).json({success:true,message:"Evènement supprimé avec succès"})
  }catch(error){
    console.log(error)
    res.json({success:false,message:error.message})
  }
})

// Paralax
router.post('/saveParalax',async(req,res)=>{
  let data = req.body
  try{
       // ---------- background image saving on the server--------------
       if(data.bgImage.includes('data:image')){
        let response = await ImageKit.upload({file : data.bgImage,fileName : "paralax_bg.png"});
        data.bgImage = response.url
        data.fileId = response.fileId
      }
 
      // ----------- Now store data to the database----------
      //------------ Contening image path store in server----
      if(data._id==null || data._id==undefined)
      {
          let paralax = new Paralax(data)
          await paralax.save()
          res.status(200).json({success:true,message:"Paralax Créer avec succès"})
      }
      else
      {
   
        await Paralax.updateOne({_id:data._id},{bgImage:data.bgImage,textContent:data.textContent})
        res.json({success:true,message:"Mise à jour du paralax réussie"})
      }
  }catch(error){
    console.log(error.message)
    res.json({success:false,message:error.message})
  }
})
router.get("/getParalax",async (req,res)=>{
  try{
    let paralax = await Paralax.findOne();
  
    res.status(200).json({success:true,message:"Successfuly get paralax",result:paralax})
 
}catch(error){
  console.log(error)
  res.json({success:false,message:error.message})
}
})

// Commande
router.post("/deleteCommande",(req,res)=>{
  res.status(200).json({success:true,message:"Successfuly check the ticket",result:req.body.id})
})
module.exports = router