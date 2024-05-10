const cloudinary = require('cloudinary').v2; 
const fs = require('fs'); 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });
    console.log(`File uploaded successfully to Cloudinary:\nURL: ${response.secure_url}`);                     
    fs.unlinkSync(localFilePath); // Remove the locally saved temporary file after upload

    return response;
  } catch (error) {
    console.log(`Error: ${error.message}`);
    fs.unlinkSync(localFilePath);  // Remove the locally saved temporary 
    return null;
  }
};
module.exports ={uploadOnCloudinary}