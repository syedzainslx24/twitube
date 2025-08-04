require('dotenv').config();
const connectDB =require('./db/index.js')
const app = require('./app.js');



connectDB()
.then(()=>{
    app.listen(process.env.PORT||3000,()=>{
        console.log(`server is running at port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection fail")
})

