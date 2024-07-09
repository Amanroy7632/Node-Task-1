const express = require('express');
const { postController,commentController } = require('../controllers');
const {authMiddleware,upload} = require("../middlewares/index.js")
const router = express.Router()
router.post("/create-post",authMiddleware,upload.single("avatar"),postController.createPost)
router.get("/get-all-post",authMiddleware,postController.getAllPosts)
router.get("/get-single-post/:postId",authMiddleware,postController.getSinglePost)
router.patch("/update-post",authMiddleware,postController.updatePost)
router.delete("/delete-post",authMiddleware,postController.deletePost)
// CRUD Operation for comments 
router.post("/add-comment",authMiddleware,commentController.addComment)
router.post("/update-comment",authMiddleware,commentController.updateComment)
router.delete("/delete-comment",authMiddleware,commentController.deleteComment)
router.get("/all-comment/:postId",authMiddleware,commentController.getPostComments)
module.exports=router