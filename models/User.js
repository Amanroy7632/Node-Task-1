const mongoose =require("mongoose")
const userSchema = mongoose.Schema({
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
  }
},{timestamps:true})
const User = mongoose.model("User",userSchema)
module.exports=User