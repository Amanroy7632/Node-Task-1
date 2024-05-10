const express = require("express")
const { Post, User,Like,Comment } = require("../models/index.js");
// const ApiResponse = require("../utils/ApiResponse.js");
const { ApiError, ApiResponse } = require("../utils/index.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
// const { default: mongoose, deleteModel } = require("mongoose");
// TODO: CRUD Operation on posts 
const createPost = async (req, res, next) => {
    try {
        const {title,isPublic,description}= req.body
        console.log(`${title}- ${isPublic} - ${description}`);
        const user = req.user
        // const postLocalFilePath = req.files?.avatar[0]?.path;
        const postLocalFilePath = req.file?.path
        console.log(postLocalFilePath);
        // if (req.files && Array.isArray(req.files.)) {

        // }
        if (!user) {
            throw new ApiError(401, "Unauthorized access")
        }
        const loggedInUser = await User.findById(req.user?._id).select("-password -refreshToken")
        if (!loggedInUser) {
            throw new ApiError(401, "Unauthorized access")
        }
        const response = await uploadOnCloudinary(postLocalFilePath)
        console.log(`Response url : ${response?.url}`);
        
        
        // const uploadedFileResponse = await uploadOnCloudinary(postLocalFilePath);
        // if (!uploadedFileResponse?.url) {
        //     res.status(500)
        //     throw new ApiError(500, "Something went wrong while uploading media files")
        // }
        console.log(`Upload response : ${response}`);
        const post = await Post.create({
            postFile: response?response.url:" not uploaded yet",
            title,
            isPublic,
            description:description?description:"",
            owner: loggedInUser
        })
        if (!post) {
            throw new ApiError(500,"Something went wrong while creating post.")
        }
        return res.status(201).json(new ApiResponse(200, post, "Post created successfully successfully"))
    } catch (error) {
        next(error)
    }
}
const getAllPosts = async (req, res,next) => {
    try {
        const user =req.user
        // const posts = await Post.find({owner:user?._id})
        // console.log(posts);
        const posts = await Post.aggregate([
            {
                $match:{
                    owner:user?._id
                }
            },
            {
               $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"postFile",
                as:"commentators"
               }
            },
            {
                $addFields:{
                    totalComments:{
                        $size:"$commentators"
                    }
                }
            },
            // {
            //     $project:{
                   
            //     }
            // }
        ])
        console.log(posts.length);
        console.log(user._id);
        // console.log(`Size: ${result.length}`);
        res.status(200).json(new ApiResponse(200, {posts,totalPost:posts.length},"All posts fetched successfully"))
    } catch (error) {
       next(error)
    }
}

const updatePost=async (req,res,next)=>{
    try {
        const {id} =req.query
        const {title,description,isPublic,postFile} =req.body
        const prevPost = await Post.findById(id)
        const post =await Post.findByIdAndUpdate(id,{
            $set:{
                title:title?title:prevPost.title,
                description:description?description:prevPost.description,
                isPublic:isPublic?isPublic:false,
                postFile:postFile?postFile:"Not post yet"

            }
        },{
            new:true
        })
        if (!id) {
            throw new ApiError(400,"Post id are required")
        }
        res.status(200).json(new ApiResponse(200,post,"Post updated successfully"))
        
    } catch (error) {
        next(error)
    }
}
const deletePost=async (req,res,next)=>{
    try {
        const {id} =req.query
        const user =req.user
        const currentUser = await User.findById(user?._id)
        if (!currentUser) {
            throw new ApiError(401,"Unauthorized access")
        }
        const deletedPost = await Post.deleteOne({_id:id})
        res.status(200).json(new ApiResponse(200,deletedPost,"Post deleted successfully"))
    } catch (error) {
        next(error)
    }
}
module.exports = { createPost,getAllPosts ,updatePost,deletePost}