const mongoose = require('mongoose');
var aggrpigatePaginate = require('mongoose-aggregate-paginate-v2');


const videoSchema = new Schema({
    videoFile:{
        required:true,
        type:String //cloudinary url
    },
    thumbnail:{
        required:true,
        type:String //cloudinary url
    },
    title:{
        required:true,
        type:String 
    },
    description:{
        required:true,
        type:String //cloudinary url
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Type.ObjectId,
        ref:"User"
    }
},
{
    timestamps:true
})

videoSchema.plugin(aggrpigatePaginate);

module.exports = mongoose.model("Video",videoSchema);