const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiErrors')
const ApiResponse = require('../utils/ApiResponse');
const userModel = require('../models/user.model');
const uploadOnCloudinary = require('../utils/cloudinary');


const registerUser = asyncHandler( async(req,res)=>{
    //1.get user details from req
    //2.validation of data (not empty)
    //3.check if users exists(if email/username is unique)
    //4.Check for images and check for avatar and uplaod to cloudinary
    //5.Create user object-create entry in db
    //6.remove password and refresh token feilds from response 
    //7.check for db creation response.
    //8.send success message 

    const {username,email,fullname,password}=req.body;
    if(
        [username,email,fullname,password].some((feild)=>{
            feild?.trim() === ""
        })
    ){
        throw new ApiError(400,"All feilds are required")
    }
    const existingUser =  userModel.findOne({
        $or: [{username},{email}]
    })
    if(existingUser){
        throw new ApiError(409,"User already Exists!");
    }
   const avatar_local_path = req.files?.avatar[0]?.path;
   const cover_local_path = req.files?.coverImage[0]?.path;

   if(!avatar_local_path){
    throw new ApiError(400,"Avatar image is required");
   }
   const avatar = await uploadOnCloudinary(avatar_local_path);
   const coverImage = await uploadOnCloudinary(cover_local_path);
   if(!avatar){
    throw new ApiError(400,"Avatar file is required");
   }
   const createdUser = await userModel.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
    email,
    password,
    username: username.toLowerCase(),
   })

   if(userModel.findById(createdUser._id).select(
    "-password -refreshToken"
   )){
    throw new ApiError(500,"Something went wrong while registering the user");
   }
   return res.status(201).json(
    new ApiResponse(200,createdUser,"User  has been registered")
   )

})


module.exports = registerUser;