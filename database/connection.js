require("dotenv").config()
let mongoose = require("mongoose")

mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const conn = mongoose.connection;
          
  conn.on('error', () => console.error.bind(console, 'connection error'));
  
  conn.once('open', () => console.info('Database connected'));
//   

function connection(){
   
        return conn
}

module.exports =  connection