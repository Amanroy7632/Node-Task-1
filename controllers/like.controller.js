const mongoose = require('mongoose')
const { Like, Comment } = require("../models/index.js")
const togglePostLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

})
const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

module.exports = {
    togglePostLike,
    toggleCommentLike,
    getLikedVideos
}