const ApiError =require("../utils/ApiError.js")
const ApiResponse = require("../utils/ApiResponse.js")
const User = require("../models/User.js")
const generateCode = require("../utils/generateCode.js")
const hashPassword = require("../utils/hashPassword.js")
const {comparePassword} = require("../validators/index.js")
const generateAccessTokenAndRefreshToken= async (userId)=>{
try {
  const user = await User.findById(userId)
  // console.log(user);
  const accessToken = await user.generateAccessToken()
  const refreshToken = await user.generateRefreshToken()
  // console.log(`Access token : ${accessToken}`);
  user.refreshToken =refreshToken
  await user.save({validateBeforeSave:false})
  return {accessToken,refreshToken}
} catch (error) {
  throw new ApiError(500,`Failed to generate token:${error.message}`)
}
}
const signup = async (req,res,next)=>{
    try {
        const {name,username,email,password}=req.body
        if(!name){
            throw new ApiError(400,"Name is required")
        }
        if(!username){
            throw new ApiError(400,"username is required")
        }
        if(!email){
            throw new ApiError(400,"Email is required")
        }
        if(!password){
            throw new ApiError(400,"Password is required")
        }
        if(!password.length>6){
            throw new ApiError(400,"Password should be 6 character long")
        }
        const user=await User.findOne({email})
        if (user) {
            throw new ApiError(400,"User already registered")
        }
        const hashedPassword=await hashPassword(password)
         const newUser = await User.create({
          name,username,email,password:hashedPassword
         })
        // const newUser =new User({name,username,email,password})
        // const result=await newUser.save()
        res.send(new ApiResponse(201,{user:newUser},"User Created Successfully"))
      } catch (error) {
        console.log(error.message);
        // throw new ApiError(400,"User Already Registered")
        next(error)
      }
}
const signin= async(req,res,next)=>{
    try {
      const {email,username,password}=req.body
      if(!((username || email) && password)){
        throw new ApiError(400,"Email or password is required")
      }
      // const hashedPassword=await hashPassword(password)
      const user =await User.findOne({email})
      if (!user) {
        throw new ApiError(400,"User Not Found or invalid credentials")
    }
    // if (user.password!==password) {
    //       throw new ApiError(400,"User Not Found or invalid credentials")
    //   }
      // if (!await comparePassword(password,user.password)) {
      //   throw new ApiError(401,"Wrong password")
      // }
    //   const token=generateToken(user)
      const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
      //  console.log(`${accessToken} refresh --> ${refreshToken}`);
      const loggedinUser = await User.findById(user._id).select("-password -refreshToken")
      const options = {
        httpOnly:true,
        secure:true
      }
      return res.status(200).cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken)
      .json(
        new ApiResponse(200,{user:loggedinUser,accessToken},"User signed in successfully")
      )
    } catch (error) {
      next(error)
    }
} 
  const forgetPasswordCode=async (req,res,next)=>{
    try {
      const {email,password}=req.body
      const user=await User.findOne({email})
      if (!user) {
        throw new ApiError(404,"User not found")
    }
      const code =generateCode(6)
      user.verificationCode=code
      await user.save()
    //   await sendEmail({toEmail:user.email,code,subject:"Forgot password code",content:"Change your password using this code"})
      res.send(new ApiResponse(200,{code},"Forgot password verification code sent successfully"))
    } catch (error) {
      next(error)
    }
}
  const resetPassword=async (req,res,next)=>{
    try {
      const {email,code,newPassword}=req.body
      const user =await User.findOne({email})
      if (!user) {
        throw new ApiError(404,"User not found")
      }
      if (code!==user.verificationCode) {
        throw new ApiError(400,"Invalid verification code")
      }
    //   const hashedPassword=await hashPassword(password)
      user.password=newPassword
      await user.save()
      res.send(new ApiResponse(200,{name:user.name,email:user.email},"Password Changed  successfully"))
  
    } catch (error) {
      next(error)
    }
}
const getUserProfile = async(req,res,next)=>{
  try {
    const user = req.user
    if (!user) {
      throw new ApiError(404,"User id is required")
    }
    const currUser = await User.findById(user?._id)
    if (!currUser) {
      throw new ApiError(400,"User not found")
    }
    const profile = await User.aggregate([
      {
        $match:{
          _id:user?._id
        }
      },
      {
        $lookup:{
          from:"posts",
          localField:"_id",
          foreignField:"owner",
          as:"totalPost", 
        }
      },
      {
        $lookup:{
          from:"comments",
          localField:"_id",
          foreignField:"owner",
          as:"totalComment",
        }
      },
      {
        $lookup:{
          from:"likes",
          localField:"_id",
          foreignField:"likedBy",
          as:"likesmade"
        }
      },
      {
        $addFields:{
          post:{
            $size:"$totalPost"
          },
          totalCommentMade:{
            $size:"$totalComment"
          },
          totalLikesMade:{
            $size:"$likesmade"
          }
        }
      },
      {
        $project:{
          _id:0,
          name:1,
          username:1,
          email:1,
          post:1,
          totalCommentMade:1,
          totalLikesMade:1
        }
      }
    ])
    res.status(200).json(new ApiResponse(200,profile[0],"User profile fetched successfully"))
  } catch (error) {
    next(error)
  }
}
module.exports ={signup,signin,forgetPasswordCode,resetPassword,getUserProfile}