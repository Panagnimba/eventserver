let AdminAuth = require("./admin-auth")

function isAdminAuthenticated(req,res,next){
    console.log("///////// Verify Authentication //////////")
    const authHeader = req.headers['authorization']
    let token = authHeader && authHeader.split(' ')[1]
    if(token == null || token == undefined) res.sendStatus(401)

    let isAuth = AdminAuth.verifyToken(token)
    if(isAuth)
        next()
    else
    res.json({success:false,message:'Token Invalide'})
}

module.exports.isAdminAuthenticated = isAdminAuthenticated