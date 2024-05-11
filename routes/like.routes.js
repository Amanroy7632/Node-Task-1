const express = require('express');
const router = express.Router()
const {authMiddleware} = require("../middlewares/index.js")
const {likeController} = require("../controllers/index.js")
// router.get("/toggle/p/:postId",authMiddleware,likeController.togglePostLike)
// router.get("/toggle/p/",(req,res)=>{
//     res.send("Hello working")
// })
router.use(authMiddleware)
router.route("/toggle/p/:postId").get(likeController.togglePostLike)
router.route("/toggle/c/:commentId").get(likeController.toggleCommentLike)
router.route("/get-all-liked-post").get(likeController.getLikedPost)

module.exports = router