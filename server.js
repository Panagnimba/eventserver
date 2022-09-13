require("dotenv").config();
let express = require("express");
let cors = require("cors");
let bcrypt = require("bcrypt");
let cookieParser = require("cookie-parser");
let path = require("path");

let app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(
  cors({
    origin: [
      "https://serverticket.herokuapp.com",
      "https://eventh24.herokuapp.com",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

let connection = require("./database/connection.js");
let Admin = require("./database/models/admin.js");
let AdminAuth = require("./auth/admin-auth");
let Auth = require("./auth/authenticate_middleware");
// connection to database
let conn = connection();

// Routes
let adminRoute = require("./routes/admin");
app.use("/eventh24", Auth.isAdminAuthenticated, adminRoute);

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
            message: "Authentification réussie",
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

app.post("/adminRegister", async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    //
    let admin = new Admin({
      username: req.body.username,
      password: hash,
      role: "admin",
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
//

let port = process.env.PORT || 9000;
app.listen(port, () => console.log("Server listenning on port ", port));
