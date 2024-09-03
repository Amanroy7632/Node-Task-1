const express = require('express');
const { authRoute, postRoute, likeRoute } = require('./routes');
const dotenv = require("dotenv")
// consfigure the dotenv file 
dotenv.config({
    path: "./.env"
})
const connectFromMongoDb = require("./DB/conn.js");
const errorHandler = require('./utils/ErrorHandler.js');
const ApiResponse = require('./utils/ApiResponse.js');

const app = express();
// connectFromMongoDb().then((response)=>{

// })
app.get("/", (req, res) => {
    res.send(new ApiResponse(200, {
        auth:
        {
            route: "/api/v1/auth",
            signup: "/signup",
            signin: "/signin",
            forgetPassword:"/forgot-password",
            resetPassword:"/reset-password",
            posts:"/user-posts"
        },
        posts:{
            createPost:"/create-post",
            getAllPost:"/get-all-post",
            getSinglePost:"/get-single-post/:postId",
            updatePost:"/update-post",
            deletPost :"/delete-post",
            addComent:"/add-comment",
            andLotsMore:true
        }
    }, "Welcome to Blog Backend!"))
})
app.use(express.json({ limit: "500mb" }))
app.use("/api/v1/auth", authRoute)
app.use("/api/v1/user", postRoute)
app.use("/api/v1/likes", likeRoute)
app.use("/api/v1/post", postRoute)
app.use(errorHandler)
module.exports = app