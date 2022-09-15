var db = require('../../config/connection')
var collection = require('../../config/collection')
var bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId

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
        let response={}
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COL).findOne({email:userData.email});
            if(user){
                bcrypt.compare(userData.password,user.password).then((state)=>{
                    if (state){
                        console.log('login success');
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    }
                    else{
                        console.log('login failed');
                        resolve({status:false});
                    }
                })
            }
            else{
                console.log('no user found');
                resolve({status:false});
            }
        })
    },

    addToCart:(prodId,userId)=>{
        let prodObj ={
            item:objectId(prodId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart = await db.get().collection(collection.CART_COL).findOne({user:objectId(userId)});
            if (userCart){
                db.get().collection(collection.CART_COL)
                .updateOne({user:objectId(userId)},
                    {
                        $push:{products:objectId(prodId)}
                    
                    }
                )
            }else{
                let cartObj = {
                    user:objectId(userId),
                    products:[prodObj]
                }
                db.get().collection(collection.CART_COL).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },

    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COL).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COL,
                        let:{prodList:'$products'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $in:['$_id','$$prodList']
                                    }
                                }
                            }
                        ],
                        as:'cartItems'
                    }
                }
            ]).toArray()
            resolve(cartItems[0].cartItems)
            
        })
    },
    getCartCount:(userId)=>{ 
        return new Promise(async(resolve,rejecct)=>{
            let cartCount = 0;
            let cart = await db.get().collection(collection.CART_COL).findOne({user:objectId(userId)})
            if (cart){
                cartCount = cart.products.length
            }
            resolve(cartCount);
        })
    }
} 