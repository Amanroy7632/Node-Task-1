const express = require("express")
const { Post, User, Like, Comment } = require("../models/index.js");
// const ApiResponse = require("../utils/ApiResponse.js");
const { ApiError, ApiResponse } = require("../utils/index.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
// const { default: mongoose, deleteModel } = require("mongoose");
// TODO: CRUD Operation on posts 
const createPost = async (req, res, next) => {
    try {
        const { title, isPublic, description } = req.body
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
            postFile: response ? response.url : " not uploaded yet",
            title,
            isPublic,
            description: description ? description : "",
            owner: loggedInUser
        })
        if (!post) {
            throw new ApiError(500, "Something went wrong while creating post.")
        }
        return res.status(201).json(new ApiResponse(200, post, "Post created successfully successfully"))
    } catch (error) {
        next(error)
    }
}
const getAllPosts = async (req, res, next) => {
    try {
        const user = req.user
        if (!user) {
            throw new ApiError(401, "Invalid credentials,Please login first")
        }
        const posts = await Post.aggregate([
            {
                $match: {
                    owner: user?._id
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "post",
                    as: "comments"
                }
            },
            // Unwind comments to perform nested lookup on users
            { $unwind: { path: "$comments", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "comments.owner",
                    foreignField: "_id",
                    as: "comments.userDetails"
                }
            },
            // Re-group comments after user details are added
            {
                $group: {
                    _id: "$_id",
                    postFile: { $first: "$postFile" },
                    title: { $first: "$title" },
                    description: { $first: "$description" },
                    isPublic: { $first: "$isPublic" },
                    comments: {
                        $push: {
                            content: "$comments.content",
                            userDetails: {
                                username: { $first: "$comments.userDetails.username" },
                                fullname: { $first: "$comments.userDetails.name" }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "post",
                    as: "totalLikes"
                }
            },
            // Unwind likes to perform nested lookup on users
            { $unwind: { path: "$totalLikes", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "totalLikes.likedBy",
                    foreignField: "_id",
                    as: "totalLikes.userDetails"
                }
            },
            // Re-group likes after user details are added
            {
                $group: {
                    _id: "$_id",
                    postFile: { $first: "$postFile" },
                    title: { $first: "$title" },
                    description: { $first: "$description" },
                    isPublic: { $first: "$isPublic" },
                    comments: { $first: "$comments" },
                    totalLikes: {
                        $push: {
                            likedBy: {
                                username: { $first: "$totalLikes.userDetails.username" },
                                fullname: { $first: "$totalLikes.userDetails.name" }
                            }
                        }
                    },
                }
            },
            {
                $addFields: {
                    totalComments: {
                        $size: "$comments"
                    },
                    totalLike: {
                        $size: "$totalLikes"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    postFile: 1,
                    title: 1,
                    description: 1,
                    isPublic: 1,
                    totalComments: 1,
                    totalLike: 1,
                    comments: 1,
                    totalLikes: 1,
                }
            }
        ])
        console.log(posts.length);
        res.status(200).json(new ApiResponse(200, { posts, totalPost: posts.length }, "All posts fetched successfully"))
    } catch (error) {
        next(error)
    }
}
const getSinglePost = async (req, res, next) => {
    try {
        const { _id } = req.user
        const { postId } = req.params
        if (!_id) {
            throw new ApiError(401,"Invalid credentials, please login first")
        }
        if(!postId){
            throw new ApiError(400,"Invalid post id ")
        }
        const post1= await Post.findById(postId)

        const post = await Post.aggregate([
            {
                $match: {
                    _id: postId,
                    owner:_id
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "post",
                    as: "comments"
                }
            },
            { $unwind: { path: "$comments", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "comments.owner",
                    foreignField: "_id",
                    as: "comments.userDetails"
                }
            },
            // Re-group comments after user details are added
            {
                $group: {
                    _id: "$_id",
                    postFile: { $first: "$postFile" },
                    title: { $first: "$title" },
                    description: { $first: "$description" },
                    isPublic: { $first: "$isPublic" },
                    comments: {
                        $push: {
                            content: "$comments.content",
                            userDetails: {
                                username: { $first: "$comments.userDetails.username" },
                                fullname: { $first: "$comments.userDetails.name" }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "post",
                    as: "totalLikes"
                }
            },
            // Unwind likes to perform nested lookup on users
            { $unwind: { path: "$totalLikes", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "totalLikes.likedBy",
                    foreignField: "_id",
                    as: "totalLikes.userDetails"
                }
            },
            // Re-group likes after user details are added
            {
                $group: {
                    _id: "$_id",
                    postFile: { $first: "$postFile" },
                    title: { $first: "$title" },
                    description: { $first: "$description" },
                    isPublic: { $first: "$isPublic" },
                    comments: { $first: "$comments" },
                    totalLikes: {
                        $push: {
                            likedBy: {
                                username: { $first: "$totalLikes.userDetails.username" },
                                fullname: { $first: "$totalLikes.userDetails.name" }
                            }
                        }
                    },
                }
            },
            {
                $addFields: {
                    totalComments: {
                        $size: "$comments"
                    },
                    totalLike: {
                        $size: "$totalLikes"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    postFile: 1,
                    title: 1,
                    description: 1,
                    isPublic: 1,
                    totalComments: 1,
                    totalLike: 1,
                    comments: 1,
                    totalLikes: 1,
                }
            }

        ])
        console.log(post.length);
        return res.status(200).send(new ApiResponse(200,post.length>0?post[0]:post1,"Post fetched"));
    } catch (error) {
        next(error)
    }
}

const updatePost = async (req, res, next) => {
    try {
        const { id } = req.query
        const { title, description, isPublic, postFile } = req.body
        const prevPost = await Post.findById(id)
        const post = await Post.findByIdAndUpdate(id, {
            $set: {
                title: title ? title : prevPost.title,
                description: description ? description : prevPost.description,
                isPublic: isPublic ? isPublic : false,
                postFile: postFile ? postFile : "Not post yet"

            }
        }, {
            new: true
        })
        if (!id) {
            throw new ApiError(400, "Post id are required")
        }
        res.status(200).json(new ApiResponse(200, post, "Post updated successfully"))

    } catch (error) {
        next(error)
    }
}
const deletePost = async (req, res, next) => {
    try {
        const { id } = req.query
        const user = req.user
        const currentUser = await User.findById(user?._id)
        if (!currentUser) {
            throw new ApiError(401, "Unauthorized access")
        }
        const deletedPost = await Post.deleteOne({ _id: id })
        res.status(200).json(new ApiResponse(200, deletedPost, "Post deleted successfully"))
    } catch (error) {
        next(error)
    }
}
module.exports = { createPost, getAllPosts,getSinglePost, updatePost, deletePost }