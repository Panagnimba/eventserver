require("dotenv").config()
let mongoose = require("mongoose")

async function connection(){
    try{
        let conn = await mongoose.connect(process.env.DATABASE_URI)
        console.log("Database connected")
        return conn;
    }catch(e){
        console.log(e)
        return null
    }
}

module.exports =  connection
