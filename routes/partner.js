let express = require("express");
let router = express.Router();
let Event = require("../database/models/event.js");

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

module.exports = router