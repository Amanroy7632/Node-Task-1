const bcrypt = require("bcryptjs")
// for data encryption using bcrypt 
const hashPassword =(password)=>{
    return new Promise((resolve,reject)=>{
        bcrypt.genSalt(12,(error,salt)=>{
            if (error) {
                return reject(error)
            }
            bcrypt.hash(password,salt,(err,hash)=>{
                if (err) {
                    return reject(err)
                }
                resolve(hash)
            })
        })
    })
}
module.exports=hashPassword