const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiErrors')
const ApiResponse = require('../utils/ApiResponse');
const userModel = require('../models/user.model');
const uploadOnCloudinary = require('../utils/cloudinary');
const jwt = require('jsonwebtoken');
const { options } = require('../routes/user.routes');

const generateAccessAndRefreshTokens = async function(user_id) {
try{
 
    const user  = await userModel.findById(user_id);
    const accessToken  =  user.generateAccessToken();
    const refreshToken =  user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false});

    return {refreshToken,accessToken};
}
catch{
    throw new ApiError(500,"Something went wrong while generating the refresh and access tokens")
}
}

const registerUser = asyncHandler( async(req,res)=>{
    
    //1.get user details from req
    const {username,email,fullname,password}=req.body;
     //2.validation of data (not empty)
    if(
        [username,email,fullname,password].some((feild)=>{
            feild?.trim() === "";
        })
    ){
        throw new ApiError(400,"All feilds are required")
    }
    //3.check if users exists(if email/username is unique)
    const existingUser = await userModel.findOne({
        $or: [{username},{email}]
    })

    if(existingUser){
        throw new ApiError(409,"User already Exists!");
    }

 //4.Check for images and check for avatar and uplaod to cloudinary
   const avatar_local_path = req.files?.avatar[0]?.path;
   const cover_local_path = req.files?.coverImage?.[0]?.path;

   if(!avatar_local_path){
    throw new ApiError(400,"Avatar image is required");
   }
   const coverImage = await uploadOnCloudinary(cover_local_path)||null;
    const avatar = await uploadOnCloudinary(avatar_local_path);

   if(!avatar){
    throw new ApiError(400,"Failed to upload avatar image on Cloudinary");
   }
 
    //5.Create user object-create entry in db

   const createdUser = await userModel.create({
    fullname,
    avatar:avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
   })
    //6.remove password and refresh token feilds from response 
    //7.check for db creation response.
   if(!await userModel.findById(createdUser._id).select(
    "-password -refreshToken"
   )){
    throw new ApiError(500,"Something went wrong while registering the user");
   }

    //8.send success message 
   return res.status(201).json(
    new ApiResponse(200,createdUser,"User  has been registered")
   )

})


//steps to login user
const loginUser = asyncHandler(async(req,res)=>{
    //1.Take username and password from request body
    let {username,password}= req.body;
    //2.Verify if username and pw are not empty
    if(
        [username,password].some((value)=>{
            value?.trim() === ""
        })
    )
    {
        throw new ApiError(400,"All feilds are required");
    }
    
//3.verify if user exists, if it does then verify the entered password is correct or not
    const existingUSer = await userModel.findOne({
        username
    })
    if (!existingUSer){
        throw new ApiError(409,"User is not registered,please Signup!");

    }
    if(!(await existingUSer.isPasswordCorrect(password))){
        throw new ApiError(400,"Password Does not match");
    }

//4.if password matches, then login user and issue an refresh and access token

    const {refreshToken,accessToken}= await 
    generateAccessAndRefreshTokens(existingUSer._id);
    const options ={
    httpOnly:true,
    secure:true}
    const loggedInUser = await userModel.findById(existingUSer._id)
    .select("-password -refreshToken");

    res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(new ApiResponse(200,loggedInUser,"Logged in User Successfully"));

})

const logoutUser = asyncHandler(async (req,res)=>{
    await userModel.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken:""
            }
        },
        {
            new:true
        }
    )
    const options ={
    httpOnly:true,
    secure:true}

    res
    .status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(new ApiResponse(200,"User logged out Successfully!"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
  try {
      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Request");   
    }
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_STRING);
    const user = userModel.findById(decodedToken?._id);
    if(!user){
        throw new ApiError(401,"Invalid refresh Token");   
    }
    if(user?.refreshToken !== incomingRefreshToken){
        throw new ApiError(401,"refresh token invalid or expired");
    }
    const {newrefreshToken,accessToken} = await generateAccessAndRefreshTokens(user._id);
    options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",newrefreshToken,options)
    .cookie("refreshToken",accessToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newrefreshToken},
            "Access token refreshed"
        )
    )
  } catch (error) {
    throw new ApiError(error.status,error.message)
  }
})
module.exports= {registerUser,loginUser,logoutUser,refreshAccessToken};