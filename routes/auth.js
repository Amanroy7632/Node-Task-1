const express = require('express');
const { authController } = require('../controllers');
const {authMiddleware} = require("../middlewares/index.js")
const router = express.Router()
router.post("/signup",authController.signup)
router.post("/signin",authController.signin)
router.post("/forgot-password",authMiddleware,authController.forgetPasswordCode)
router.post("/reset-password",authMiddleware,authController.resetPassword)
router.get("/user-posts",authMiddleware,authController.getUserProfile)
module.exports = router