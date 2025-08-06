const userModel = require('../models/user.model');
const ApiError = require('../utils/ApiErrors');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');


const verifyJWT = asyncHandler(async (req,_,next)=>{
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");

    if(!token){
        throw new ApiError(401,"Unauthorized Access,token does not exist")
    }

   const decodedData = jwt.verify(token,process.env.ACCESS_TOKEN_STRING);

    const user = await userModel.findById(decodedData?._id).select("-password -refreshToken");
    //frontend point
    if(!user){
        throw new ApiError(404,"invalid user token")
    }
    req.user = user;
    next();
   } catch (error) {
    console.log(error);
        throw new ApiError(404,"Invalid access token");
   }

})
module.exports = verifyJWT;