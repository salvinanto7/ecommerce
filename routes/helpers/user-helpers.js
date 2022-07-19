var db = require('../../config/connection')
var collection = require('../../config/collection')
var bcrypt = require('bcrypt')
module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.password = await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COL).insertOne(userData).then((data)=>{
                resolve(data)
            })
        })
        

    }
}