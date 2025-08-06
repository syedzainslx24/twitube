const mongoose = require('mongoose');



const subscriptionSchema = mongoose.Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,//one to whom "subscriber is subscribing "
        ref:"User"
    },



},{
    timestamps:true
})



module.exports = mongoose.model("Subscription",subscriptionSchema);