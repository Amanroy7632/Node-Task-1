const mongoose = require('mongoose')
const {ApiError,ApiResponse} = require("../utils/index.js")
const { Post,Like, Comment } = require("../models/index.js")
const togglePostLike = async (req, res,next) => {
    //TODO: toggle like on post
    try {
        const user = req.user
        const { postId } = req.params
        if (!user) {
            throw new ApiError(401,"Unauthorized access to post")
        }
        const post = await Post.findById(postId).select("-isPublic -owner -createdAt -updatedAt -__v")
        if (!post) {
            throw new ApiError(404,"Post not found.")
        }
        // console.log(post);
        const alreadyLiked = await Like.findOne({likedBy:user._id,post:postId})
        if (alreadyLiked) {
            const removedLike = await Like.findOneAndDelete({likedBy:user._id,post})
            return  res.status(200).json( new ApiResponse(200,removedLike,"Post unliked successfully"))
        }
        const likeResult = await Like.create({post,likedBy:user._id})
        if (!likeResult) {
            throw new ApiError(500,"Something went wrong while Liking post")
        }
        console.log(`Post id ${postId}`);
        return res.status(200).json( new ApiResponse(200,likeResult,"Post Liked successfully"))
    } catch (error) {
        next(error)
    }
}

const toggleCommentLike = async (req, res,next) => {
    try {
        const { commentId } = req.params
        const user = req.user
        if (!user) {
            throw new ApiError(401,"Unauthorized access to post")
        }
        const alreadyLiked = await Like.findOne({comment:commentId})
        if (alreadyLiked) {
            const disLike = await Like.findOneAndDelete({comment:commentId,likedBy:user?._id})
            return res.status(200).json(new ApiResponse(200,disLike,"Comment disliked successfully"))
        }

        const likeComment = await Like.create({comment:commentId,likedBy:user?._id})
        res.status(200).json(new ApiResponse(200,likeComment,"Comment liked successfully"))
    } catch (error) {
        next(error)
    }
    //TODO: toggle like on comment

}
const getLikedPost = async (req, res) => {
    //TODO: get all liked videos
    try {
        const user = req.user 
        if (!user) {
            throw new ApiError(400,"User id is required")
        }
        const likedPosts = await Like.find({likedBy:user?._id})
        // const allLikedPosts= await Like.aggregate([
        //       {
        //         $match:{
        //             likedBy:user?._id,
        //             comment:null
        //         }
        //       },
        //       {
        //         $lookup:{
        //             from:"posts",
        //             localField:"post",
        //             foreignField:"_id",
        //             as:"likedPosts"
        //         }
        //       },
        //     //   {
        //     //     $lookup:{
        //     //         from:"users",
        //     //         localField:"likedBy",
        //     //         foreignField:"_id",
        //     //         as:"usersData"
        //     //     }
        //     //   },
        //       {
        //         $addFields:{
        //             totalLikedPosts:{
        //                 $size:"$likedPosts"
        //             },

        //         }
        //       },
        //       {
        //         $project:{
        //             _id:0,
        //             likedBy:1,
        //             // likedPosts:1,
        //             posts:{
        //                 $map:{
        //                     input:"likedPosts",
        //                     as:"post",
        //                     in:{
        //                         post_id:"$$post._id",
        //                         title:"$$post.title",
        //                         description:"$$post.description",
        //                     }
        //                 }
        //             }
        //             // usersData:1
                   
        //         }
        //       }
        // ])
        const allLikedPosts= await Like.aggregate([
            {
              $match:{
                  likedBy:user?._id,
                  comment:null
              }
            },
            {
              $lookup:{
                  from:"posts",
                  localField:"post",
                  foreignField:"_id",
                  as:"likedPosts"
              }
            },
          //   {
          //     $lookup:{
          //         from:"users",
          //         localField:"likedBy",
          //         foreignField:"_id",
          //         as:"usersData"
          //     }
          //   },
            {
              $addFields:{
                  totalLikedPosts:{
                      $size:"$likedPosts"
                  },

              }
            },
            {
              $project:{
                  _id:0,
                  likedBy:1,
                  likedPosts:1,
                //   Lpost:{
                //       $map:{
                //           input:"likedPosts",
                //           as:"Lpost",
                //           in:{
                //               post_id:"$$Lpost._id",
                //               title:"$$Lpost.title",
                //               description:"$$Lpost.description",
                //           }
                //       }
                //   }
                  // usersData:1
                 
              }
            }
      ])
        console.log(allLikedPosts.length);
        res.status(200).json(new ApiResponse(200,allLikedPosts,"Liked posts fetched successfully"))

    } catch (error) {
        
    }
}

module.exports = {
    togglePostLike,
    toggleCommentLike,
    getLikedPost
}