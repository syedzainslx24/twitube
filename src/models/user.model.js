const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowecase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowecase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    }, 
    avatar:{
        type:String,//cloudinary service will be used.
        required:true
    },
    coverImage:{
        type:String
    },
    watchHistory:[
{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshToken:{
        type:String
    }
    },
    {
        timesstamps:true
    }
)

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10);
    next();
})



userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
   return jwt.sign({
        _id: this.id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_STRING,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this.id,
    },
    process.env.REFRESH_TOKEN_STRING,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}


module.exports = mongoose.model("User",userSchema);