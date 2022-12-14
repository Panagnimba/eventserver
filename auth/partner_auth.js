let jwt = require('jsonwebtoken');

function generateToken(payload){
    let token = jwt.sign(payload,process.env.ACCESS_PARTNER_TOKEN_SECRET,{expiresIn:'24h'})
    return token
}

function verifyToken(token){
    try{
        jwt.verify(token,process.env.ACCESS_PARTNER_TOKEN_SECRET)
        return true
    }catch(error){
        return false
    }
}
module.exports.generateToken = generateToken
module.exports.verifyToken = verifyToken