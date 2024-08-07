const ApiError =require("../utils/ApiError.js")
const errorHandler =(error,req,res,next)=>{
  const code =error.statusCode?error.statusCode:500
//   console.log(`Error: ${error.stack}`);
 return res.status(code).send(new ApiError(code,`${error.message}`,error.stack))
}
module.exports=errorHandler