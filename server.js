require("dotenv").config();
let express = require("express");
let cors = require("cors");
let bcrypt = require("bcrypt");
let cookieParser = require("cookie-parser");
let path = require("path");
// HOME
let Menu = require("./database/models/menu.js");
let Banner = require("./database/models/banner.js");
let Event = require("./database/models/event.js");
let Paralax = require("./database/models/paralax.js");
//
let app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  cors({
    origin: [
      "https://serverticket.herokuapp.com",
      "https://eventh24.herokuapp.com",
      'http://eventh24.herokuapp.com',
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

let connection = require("./database/connection.js");
let User = require("./database/models/user.js");
let UserAuth = require("./auth/user_auth");
let User_middleware = require("./auth/user_middleware");
//
let Admin = require("./database/models/admin.js");
let AdminAuth = require("./auth/admin_auth");
let Admin_middleware = require("./auth/admin_middleware");
//
let Partner = require("./database/models/partner.js");
let PartnerAuth = require("./auth/partner_auth");
let Partner_middleware = require("./auth/partner_middleware");
// connection to database
let conn = connection();

// Routes
let adminRoute = require("./routes/admin");
let userRoute = require("./routes/user");
let partnerRoute = require("./routes/partner");
app.use("/eventh24", Admin_middleware.isAdminAuthenticated, adminRoute);
app.use("/user", User_middleware.isUserAuthenticated, userRoute);
app.use("/partner", Partner_middleware.isPartnerAuthenticated, partnerRoute);
//

app.post("/adminLoggin", async (req, res) => {
  try {
    let docs = await Admin.find({ username: req.body.username });
    if (docs.length >= 1) {
      let match = false;
      //
      docs.forEach((doc) => {
        match = bcrypt.compareSync(req.body.password, doc.password);
        if (match) {
          let admin = { _id: doc._id, username: doc.username, role: doc.role };
          let token = AdminAuth.generateToken(admin);
          //

          // res.cookie("x-auth-token",token,{ expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000)})
          //
          res.status(200).json({
            success: true,
            message: "Authentification r??ussie",
            token: token,
          });
        }
      });
      if (match == false) {
        res.json({ success: false, message: "Authentification invalide" });
      }
      //
    } else
      res.json({ success: false, message: "Cet administrateur n'existe pas" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});
app.post("/partnerLoggin", async (req, res) => {
  try {
    let doc = await Partner.findOne({ username: req.body.username,password:req.body.password });
    if (doc) {
      let partner = {
        username : doc.username,
        password:doc.password,
      }
      let token = PartnerAuth.generateToken(partner);
        res.status(200).json({
          success: true,
          message: "Authentification r??ussie",
          token: token,
        });
    } else
      res.json({ success: false, message: "Echec d'authentification" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
//
app.post("/userRegister", async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    // adaption du numero de telephone
    req.body.tel = req.body.tel.replace(/\s/g, "");
    let phone = req.body.tel;
    if (!phone.startsWith("+226") && !phone.startsWith("00226")) {
      req.body.tel = `+226${phone}`;
    }
    if (phone.startsWith("00226")) {
      req.body.tel = `+226${phone.slice(5)}`;
    }
    //
    let user = new User({
      nom: req.body.nom,
      prenom: req.body.prenom,
      email: req.body.email,
      tel: req.body.tel,
      password: hash,
    });
    await user.save();

    let userDoc = { _id: user._id, tel: user.tel, prenom: user.prenom };
    let token = UserAuth.generateToken(userDoc);
    res.status(200).json({
      success: true,
      message: "Compte cr???? avec succ??s",
      token: token,
      user: userDoc,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});
app.post("/userLoggin", async (req, res) => {
  try {
    // adaption du numero de telephone
    req.body.tel = req.body.tel.replace(/\s/g, "");
    let phone = req.body.tel;
    if (!phone.startsWith("+226") && !phone.startsWith("00226")) {
      req.body.tel = `+226${phone}`;
    }
    if (phone.startsWith("00226")) {
      req.body.tel = `+226${phone.slice(5)}`;
    }
    //
    let user = await User.findOne({ tel: req.body.tel });
    match = bcrypt.compareSync(req.body.password, user.password);
    if (match) {
      let userDoc = { _id: user._id, tel: user.tel, prenom: user.prenom };
      let token = UserAuth.generateToken(userDoc);
      res.status(200).json({
        success: true,
        message: "Authentification r??ussie",
        token: token,
        user: userDoc,
      });
    } else res.json({ success: false, message: "Authentification ??chou??e" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});
// HOME PAGE
app.get("/getMenus", async (req, res) => {
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

app.get("/getBanner", async (req, res) => {
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

// event still also visible in the home page 
//before 1 day after the expire event date
app.get("/getEvents", async (req, res) => {
  try {
    let event = []
    let allEvents = await Event.find();
// event still also visible in the home page 
//before 1 day after the expire event date
    let currentDate = new Date().getTime()
    allEvents.forEach(evt=>{
      evtDate = new Date(evt.date).getTime()
      if(evtDate > (currentDate - 24*60*60*1000)) // current date - 1 day
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
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});

app.get("/getEvent/:id", async (req, res) => {
  try {
      let event = await Event.findOne({ _id: req.params.id });
    if(event)
    {
        let currentDate = new Date().getTime()
        let evtDate = new Date(event.date).getTime()
        if(evtDate > currentDate) 
        {
          let copy = JSON.parse(JSON.stringify(event));
          copy.gmtDate = currentDate
          res
            .status(200)
            .json({
              success: true,
              message: "Successfuly get events list",
              result: copy,
            });
        }
        else
        res.json({ success: false, message:"Event not available (time past)" });
        
    }
    else
      res.json({ success: false, message:"Event not found (invalid event)" });
    } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
});
// Paralax
app.get("/getParalax", async (req, res) => {
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
let port = process.env.PORT || 9000;
app.listen(port, () => console.log("Server listenning on port ", port));
