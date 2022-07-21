const collection = require('../../config/collection');
var db = require('../../config/connection');
var objectId = require('mongodb').ObjectId

module.exports={
    
    addProduct:(product,callback)=>{
     console.log(product);
     db.get().collection(collection.PRODUCT_COL).insertOne(product).then((data)=>{
        //console.log(data.insertedId.toString());
        callback(data.insertedId.toString());
     })
    },

    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products =await db.get().collection(collection.PRODUCT_COL).find().toArray();
            resolve(products)
        })
    },
    deleteProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COL).deleteOne({_id:objectId(prodId)}).then((response)=>{
                resolve(response);
            })
        })

    }
}