const { registerFont,createCanvas, loadImage } = require('canvas')
let fs = require('fs')
var path = require('path');
// 
let width = 500;
let height = 200
// 
registerFont('lobster.ttf', { family: 'lobster' })
const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d')

ctx.font = 'bold 20pt lobster'

async function createTicket(Pevtimg,pqrcode,peventtitle,pheure,plieu,pnomclient){
  let image = await loadImage("ticketTemplate.png")
    await ctx.drawImage(image, 0, 0,width,height)
    // left event image
    let eventImage = await loadImage(Pevtimg)
      await ctx.drawImage(eventImage, 0, 0,200,height)
      
     let qrcode = await loadImage(pqrcode)
    
        ctx.fillStyle = '#f3f4f6'
        ctx.strokeStyle = '#f3f4f6'
 
        ctx.fillText(peventtitle, 210,40)
        
        ctx.strokeText(pheure, ((width+60)/2),(height/2))
    
        ctx.font = '10pt lobster'
        ctx.fillText(plieu, (width/2),(height-50))
        ctx.fillText(pnomclient, (width/2),(height-17))
    
        await ctx.drawImage(qrcode,(width-110),(height-110),100,100)
        // const buffer = canvas.toBuffer('image/png')
        // fs.writeFileSync("./img.png",buffer)
        return await canvas.toDataURL('image/png')
}
// createTicket('lenna.png','qrcode.png',"Floby en concert live des artistes","20h45","Stade municipa","Panagnimba")
module.exports = createTicket;