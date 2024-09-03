const mongoose =require("mongoose")
const connectFromMongoDb=async()=>{
    try {
        const response =await mongoose.connect(process.env.CONNECTION_URL)
        // console.log(`Database Connected Successfully with mongoose.`)
        return response
    } catch (error) {
        console.log(`Error connecting to Mongo database: ${error.message}`);
    }
}
module.exports=connectFromMongoDb