let express = require("express")
let fs = require("fs")
let router = express.Router();
let connection = require("../database/connection.js")
let Menu = require("../database/models/menu.js")
let Banner = require("../database/models/banner.js")
let Event = require("../database/models/event.js")
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
  let serverName = req.protocol + '://' + req.get('host')
  let path = "./uploads/banner"
  let data = req.body
  try{
      // ---------- background image saving on the server--------------
        if(data.bgImage.includes('data:image')){
          let Bgbase64Data = data.bgImage.split(",")[1]
          fs.writeFileSync(`${path}/bg.png`, Bgbase64Data, 'base64');
          data.bgImage = `${serverName}/banner/bg.png`
        }
      // ------------------------------------------
      // ---------- Items images saving on the server -----------------
        data.items.forEach((item,i) => {
          if(item.img.includes('data:image')){
            let Itembase64Data = item.img.split(",")[1]
            fs.writeFileSync(`${path}/item-${i+1}.png`, Itembase64Data, 'base64');
            item.img = `${serverName}/banner/item-${i+1}.png`
          } 
          else
          {
            let decomp = item.img.split('/') //exemple ['http:', '', 'localhost:9000', 'banner', 'item-1.png']
            let it = decomp[decomp.length - 1] // get the last == image name (item-1.png)
            // 
            try{
                if(fs.existsSync(`${path}/${it}`,'utf8')){
                  fs.renameSync( `${path}/${it}`, `${path}/item-${i+1}.png`)
                  item.img = `${serverName}/banner/item-${i+1}.png`
                  console.log("rename---------------------------")
                }
                else
                  data.items.splice(i, 1); // delete this element   
              }catch(e){
               console.log(e.message)
              }
          }
        });
      // ----------- Now store data to the database----------
      //------------ Contening image path store in server----
      if(req.body._id==null || req.body._id==undefined)
      {
          let banner = new Banner(req.body)
          await banner.save()
          res.status(200).json({success:true,message:"Slider Créer avec succès"})
      }
      else
      {
        await Banner.updateOne({_id:req.body._id},{bgImage:req.body.bgImage,items:req.body.items})
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
  let serverName = req.protocol + '://' + req.get('host')
  let path = "./uploads/event"
  let data = req.body
    try{
       // ---------- define the image name --------------
            let myEvent = new Event(data) // event to save if id is null
            let imgName = ""
            if(req.body._id==null || req.body._id==undefined)
              imgName = myEvent._id
            else
              imgName = req.body._id
       // ---------- image saving on the server--------------
       if(data.img.includes('data:image')){
        imgName = `${imgName}.png`
        let Bgbase64Data = data.img.split(",")[1]
        fs.writeFileSync(`${path}/${imgName}`, Bgbase64Data, 'base64');
        data.img = `${serverName}/event/${imgName}`
      }
      if(req.body._id==null || req.body._id==undefined){
        // ------------------------------------------  
          await myEvent.save()
          res.status(200).json({success:true,message:"Evènement Créé avec succès"})
        // ------------------------------------------
      }
      else{
        await Event.updateOne({_id:req.body._id},data)
        res.json({success:true,message:"Evenement modifier avec succès"})
      }
    
      }catch(error){
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
module.exports = router