const express = require('express');
const { authController } = require('../controllers');
const router = express.Router()
router.post("/signup",authController.signup)
router.post("/signin",authController.signin)
router.post("/forgot-password",authController.forgetPasswordCode)
router.post("/reset-password",authController.resetPassword)
module.exports = router