const http = require("http")
const app=require("./app.js")
const server = http.createServer(app)
const PORT = 8000;
server.listen(PORT,()=>{
    console.log(`Server listening on ${PORT}`);
})