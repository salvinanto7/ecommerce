const collection = require('../../config/collection');
var db = require('../../config/connection');

module.exports={
    
    addProduct:(product,callback)=>{
     console.log(product);
     db.get().collection('product').insertOne(product).then((data)=>{
        //console.log(data.insertedId.toString());
        callback(data.insertedId.toString());
     })
    },

    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products =await db.get().collection(collection.PRODUCT_COL).find().toArray();
            resolve(products)
        })
    }
}