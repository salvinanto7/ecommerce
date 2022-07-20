var db = require('../../config/connection')
var collection = require('../../config/collection')
var bcrypt = require('bcrypt')
module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(userData.password)
            userData.password = await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COL).insertOne(userData).then((data)=>{
                resolve(data)
            })
        })
        

    },

    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COL).findOne({email:userData.email});
            if(user){
                bcrypt.compare(userData.password,user.password).then((state)=>{
                    if (state){
                        console.log('login success');
                    }
                    else{
                        console.log('login failed');
                    }
                })
            }
            else{
                console.log('no user found');
            }
        })
    }
} 