const mongoose =require("mongoose")
const likeSchema = new mongoose.Schema({
    post:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"Post"
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
}, {timestamps: true})

const Like = mongoose.model("Like", likeSchema)
module.exports=Like