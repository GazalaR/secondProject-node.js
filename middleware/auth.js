const jwt= require('jsonwebtoken');
const config= require('../configs/config');

    const  verifyToken = async (req, res, next) => {

    const token = req.body.token || req.query.token || req.headers["authorization"];
    
   
    
    if(!token){
        return res.send({result:"token is required"})
    }
    try{
        const data= jwt.verify(token,config.secret_jwt)
        req.user=data
    }catch(err){
        res.send(err.message)
    }

      return next();
    }
    module.exports = verifyToken;







