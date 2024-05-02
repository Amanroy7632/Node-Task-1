const ApiError =require("../utils/ApiError.js")
const ApiResponse = require("../utils/ApiResponse.js")
const User = require("../models/User.js")
const generateCode = require("../utils/generateCode.js")
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
        // const hashedPassword=await hashPassword(password)
        const newUser =new User({name,username,email,password})
        const result=await newUser.save()
        res.send(new ApiResponse(201,result,"User Created Successfully"))
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
    //   const hashedPassword=await hashPassword(password)
      const user =await User.findOne({email})
      if (!user) {
        throw new ApiError(400,"User Not Found or invalid credentials")
    }
    if (user.password!==password) {
          throw new ApiError(400,"User Not Found or invalid credentials")
      }
    //   if (!await comparePassword(password,user.password)) {
    //     throw new ApiError(401,"Wrong password")
    //   }
    //   const token=generateToken(user)
      res.send(new ApiResponse(200,{user},"User signed in successfully"))
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
module.exports ={signup,signin,forgetPasswordCode,resetPassword}