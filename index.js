const http = require("http")
const app = require("./app.js");
const connectFromMongoDb = require("./DB/conn.js");
const { exit } = require("process");
// const server = http.createServer(app)
const PORT = process.env.PORT || 3000;
connectFromMongoDb().then((response) => {
    if(response){

        console.log(`Database Connected successfully\nHosted : ${response.connection.host}`);
        app.listen(PORT, () => {
            console.log(`Server listening on ${PORT}`);
        })
    }
}).catch((error) => {
    console.log(`Error connecting to MongoDB : ${error.message}`);
    exit(0)
})
