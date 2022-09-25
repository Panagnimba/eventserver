let UserAuth = require("./user-auth")

function isUserAuthenticated(req,res,next){
    const authHeader = req.headers['authorization']
    let token = authHeader && authHeader.split(' ')[1]
    if(token == null || token == undefined) res.sendStatus(401)
    
    console.log("///////// Verify User Authentication //////////")

    let isAuth = UserAuth.verifyToken(token)
    if(isAuth)
        next()
    else
    res.json({success:false,message:'Token Invalide'})
}

module.exports.isUserAuthenticated = isUserAuthenticated