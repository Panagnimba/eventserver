let jwt = require('jsonwebtoken');

function generateToken(payload){
    let token = jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30m'})
    return token
}

function verifyToken(token){
    try{
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        return true
    }catch(error){
        return false
    }
}
module.exports.generateToken = generateToken
module.exports.verifyToken = verifyToken