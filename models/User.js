const mongoose =require("mongoose")
const jwt =require("jsonwebtoken")
const userSchema = new mongoose.Schema({
 name:{
    type:String,
    required:true,
 },
 username:{
    type:String,
    required:true,
    unique:true
 },
 email:{
    type:String,
    required:true,
    unique:true
 },
 password:{
    type:String,
    required:true
 },
 verificationCode:{
    type:String
  },
  refreshToken:{
   type:String
  }
},{timestamps:true})
userSchema.methods.generateAccessToken=async function (){
   // console.log(process.env.REFRESH_TOKEN_SECRET);
   return jwt.sign(
      {
         _id:this._id,
         email:this.email,
         username:this.username,
         name:this.name
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
         expiresIn:process.env.ACCESS_TOKEN_EXPIRY
      }
   )
}
userSchema.methods.generateRefreshToken=async function (){
   return jwt.sign(
      {
         _id:this._id,
         email:this.email,
         username:this.username,
         name:this.name
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
         expiresIn:process.env.REFRESH_TOKEN_EXPIRY
      }
   )
}
// userSchema.methods.generateRefreshToken
const User = mongoose.model("User",userSchema)
module.exports=User