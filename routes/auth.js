const express = require('express');
const { authController } = require('../controllers');
const router = express.Router()
router.post("/signup",authController.signup)
router.post("/signin",authController.signin)
router.post("/forgot-password",authController.forgetPasswordCode)
router.post("/reset-password",authController.resetPassword)
router.get("/hello",(req,res,next)=>{
    console.log("Say Hello");
    res.json({code:200,message:"Response from server"})
})
module.exports = router