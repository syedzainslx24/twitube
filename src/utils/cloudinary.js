const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:process.env.CLOUDINARY_API_KEY , 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary= async function(localFilePath){
    try{
        if(!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully
        
        if(response){
    console.log("File has been uploaded successfully.",response.url);
        await fs.promises.unlink(localFilePath).catch(() => {});
        }
       
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath);
        //remove the temperory saved file as the upload operation has failed.
        return null
    }
}

module.exports = uploadOnCloudinary;