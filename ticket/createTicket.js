const { createCanvas, loadImage } = require('canvas')
let fs = require('fs')
var path = require('path');
// 
let width = 500;
let height = 200
// 
const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d')

ctx.font = 'bold 15pt Impact'

async function createTicket(Pevtimg,pqrcode,peventtitle,pheure,plieu,pnomclient){
  let image = await loadImage("ticketTemplate.png")
    ctx.drawImage(image, 0, 0,width,height)
    // left event image
    let eventImage = await loadImage(Pevtimg)
      ctx.drawImage(eventImage, 0, 0,200,height)
      
     let qrcode = await loadImage(pqrcode)
    
        ctx.fillStyle = '#fff'
        ctx.fillText(peventtitle, width/2,40)
        
        ctx.fillText(pheure, ((width+40)/2),(height/2))
    
        ctx.font = '10pt Arial'
        ctx.fillText(plieu, (width/2),(height-48))
        ctx.fillText(pnomclient, (width/2),(height-15))
    
        ctx.drawImage(qrcode,(width-110),(height-110),100,100)
        const buffer = canvas.toBuffer('image/png')
        return buffer
}

module.exports = createTicket;