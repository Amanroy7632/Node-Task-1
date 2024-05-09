const mongoose = require("mongoose")
const postSchema = new mongoose.Schema(
    {
        postFile: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
        },
        isPublic: {
            type: Boolean,
            default: false
        }
        ,
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        // likeCount: {
        //    type:[
        //     {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: "Like",
        //     }
        //    ]
        // },
        // comments: {
        //     type: [
        //         {
        //             type: mongoose.Schema.Types.ObjectId,
        //             ref: "Comment"
        //         }
        //     ],

        // }

    },
    { timestamps: true })
const Post = mongoose.model("Post", postSchema)
module.exports = Post