const { ObjectId } = require("mongoose")
const mongoose = require("mongoose")
const { Comment, Post, User } = require("../models/index.js")
const { ApiError, ApiResponse, ErrorHandler } = require("../utils/index.js")
// TODO:  CRUD Operation on comments 

const getPostComments = async (req, res,next) => {
    //TODO: get all comments for a video
    try {
        const { postId } = req.params
        const user =req.user;
        // const { postId } = req.body
        const { page = 1, limit = 10 } = req.query
        if (!postId) {
            throw new ApiError(404,"Post id is required")
        }
        const post = await Post.findById(postId).select("-owner -updatedAt -isPublic -post -likeCount -comments")
        console.log(postId);
        const comments = await Comment.find({post:postId}).skip(page-1).limit(limit).sort({updatedAt:-1}).select("-_id -post -createdAt -updatedAt")
        const result = await Post.aggregate([
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(postId)
                }
            },
            {
                $lookup:{
                    from:"comments",
                    localField:"_id",
                    foreignField:"post",
                    as:"totalComments"
                }
            },
            {
                $addFields:{
                    totalComment:{
                        $size:"$totalComments"
                    }
                }
            },
            {
                $project:{
                    _id:0,
                    title:1,
                    description:1,
                    totalComments:1,
                    totalComment:1,
                    // totalcomment:{
                    //     $map:{
                    //         input:"totalComments",
                    //         as:"comment",
                    //         in:{
                    //             post_id:"$$comment._id",
                    //             title:"$$comment.eachcomment",
                    //         }
                    //     }
                    // }
                    // "totalComments.owner":0
                }
            }
        ])
        console.log(result);
        // console.log(comments.length);
        // const allDetail = await User.aggregate(
        //     [
        //         {
        //             $match:{
        //                 _id:user._id
        //             }
        //         },
        //         {
        //             $lookup:{
        //                 from:"comments",
        //                 localField:"post",
        //                 foreignField:"owner",
        //                 as :"Totalcommentator"
        //             }
        //         },
        //         {
        //             $addFields:{
        //                 commentCount:{
        //                   $size:"$owners"
        //                 },

        //             }
        //         },
        //         {
        //             $project:{
        //                name:1,
        //                email:1,
        //                commentCount:1
                       
        //             }
        //         }

        //     ]
        // )
        // console.log(allDetail[0]);
        res.status(200).json(new ApiResponse(200,result[0],"Comments are fetched successfully"))
    } catch (error) {
        next(error)
    }



}

const addComment = async (req, res, next) => {
    // TODO: add a comment to a post
    try {
        // const { postId } = req.params
        const user = req.user
        const { content, postId } = req.body
        console.log(`post id: ${postId}`);
        if (!postId) {
            throw new ApiError(400, "Post id is required.")
        }
        // const comment = Comment.findById(mongoose.Schema.ObjectId(postId))
        const post = await Post.findById(postId)
        // console.log(post);
        if (!post) {

            throw new ApiError(400, "Post not found")
        }
        const comment = await Comment.create({
            content,
            post: post._id,
            owner: user._id
        })
        return res.status(201).json(new ApiResponse(200, comment, "Your comment has been added to this post"))
    } catch (error) {
        next(error)
    }

}

const updateComment = async (req, res, next) => {
    // TODO: update a comment
    try {
        // const { commentId } = req.params

        const currentUser = req.user
        const { content, commentId } = req.body
        // console.log(currentUser);
        // console.log(content);
        console.log(`Comment Id: ${commentId}`);
        if (!commentId) {
            throw new ApiError(401, "Comment Id is required")
        }
        if (!currentUser) {
            throw new ApiError(401, "Unauthorized access to comment")
        }
        const comment = await Comment.findById(commentId)
        console.log(comment);
        if (!comment) {
            throw new ApiError(400, "Comment not found.")
        }
        if (comment.owner.toString() !== currentUser._id.toString()) {
            throw new ApiError(401, "Unauthorized access to comment")
        }
        const result = await Comment.findByIdAndUpdate(commentId,
            {
                $set: {
                    content
                }
            },
            {
                new: true
            });
        return res.status(200).json(new ApiResponse(200, result, "Comment Updated Successfully"))
    } catch (error) {
        console.log(`Error is: ${error.message}`);
        next(error)
    }
}

const deleteComment = async (req, res, next) => {
    // TODO: delete a comment
    try {
        const { commentId } = req.query
        const currentUser = req.user
        console.log(`Comment id: ${commentId}`);
        if (!commentId) {
            throw new ApiError(401, "Comment Id is required")
        }
        if (!currentUser) {
            throw new ApiError(401, "Unauthorized access to delete comment")
        }
        const comment = await Comment.findById(commentId)
        console.log(comment);
        if (comment?.owner.toString() !== currentUser._id.toString()) {
            throw new ApiError(401, "Unauthorized access to comment")
        }
        const result = await Comment.findOneAndDelete(commentId)
        res.status(200).json(new ApiResponse(200, result, "Comment deleted successfully"))
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getPostComments,
    addComment,
    updateComment,
    deleteComment
}