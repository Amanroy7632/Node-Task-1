const {v2} = require("cloudinary")
const fs = require("fs")
v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});
const uploadOnCloudinary = async (localFilePath)=>{
    try {
        console.log(`API_KEY: ${process.env.CLOUDINARY_API_KEY}`);
        console.log(`local file path: ${localFilePath}`);
        if (!localFilePath) {
            return null;
        }
        const response = await v2.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log(response);
        console.log(`File is uploaded successfully to cloudinary:\n File Path is: ${response?.url}`);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log(`Error: ${error.message}`);
      fs.unlinkSync(localFilePath)
      return null;
    }
}
module.exports ={uploadOnCloudinary}