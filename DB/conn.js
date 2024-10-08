const mongoose =require("mongoose")
const connectFromMongoDb=async()=>{
    try {
        const connectingUrl =`${process.env.CONNECTION_URL}/${process.env.DB_NAME}`
        console.log(connectingUrl);
        
        const response =await mongoose.connect(connectingUrl)
        // console.log(`Database Connected Successfully with mongoose.`)
        return response
    } catch (error) {
        console.log(`Error connecting to Mongo database: ${error.message}`);
        return null
    }
}
module.exports=connectFromMongoDb