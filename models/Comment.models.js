const mongoose = require("mongoose")
const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        postFle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true
    }
)


// commentSchema.plugin(mongooseAggregatePaginate)
const Comment = mongoose.model("Comment", commentSchema)
module.exports = Comment