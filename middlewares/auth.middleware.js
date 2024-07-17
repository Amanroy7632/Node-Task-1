const {User} = require("../models/index.js")
const {ApiError} = require("../utils/index.js")
const jwt = require("jsonwebtoken")
const verifyToken = async (req,res,next)=>{
    try {
        const accessToken = req.cookiies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!accessToken) {
            throw new ApiError(401,"Unauthorized access")
        }
        const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
        console.log(decodedToken?.exp);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401,"Invalid access token")
        }
        req.user=user
        next()
    } catch (error) {
        console.log(error.message);
        next(error)
        // throw new ApiError(401,"Invalid access token")
    }
}
module.exports=verifyToken