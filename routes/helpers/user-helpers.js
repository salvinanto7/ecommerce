var db = require("../../config/connection");
var collection = require("../../config/collection");
var bcrypt = require("bcrypt");
const { ObjectID } = require("bson");
const e = require("express");
const { response } = require("express");
var objectId = require("mongodb").ObjectId;

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      console.log(userData.password);
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection(collection.USER_COL)
        .insertOne(userData)
        .then((data) => {
          resolve(data);
        });
    });
  },

  doLogin: (userData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COL)
        .findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((state) => {
          if (state) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("no user found");
        resolve({ status: false });
      }
    });
  },

  addToCart: (prodId, userId) => {
    let prodObj = {
      item: objectId(prodId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COL)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        //console.log(userCart.products.getIndex(objectId(prodId)));
        let prodExist = userCart.products.findIndex(
          (product) => product.item == prodId
        );
        //console.log(prodExist)
        if (prodExist != -1) {
          db.get()
            .collection(collection.CART_COL)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(prodId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COL)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: prodObj },
              }
            );
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [prodObj],
        };
        db.get()
          .collection(collection.CART_COL)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COL)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COL,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          /*
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
                }*/
        ])
        .toArray();
      //console.log(cartItems)
      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, rejecct) => {
      let cartCount = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COL)
        .findOne({ user: objectId(userId) });
      if (cart) {
        cartCount = cart.products.length;
      }
      resolve(cartCount);
    });
  },
  changeProductQuantity: (details) => {
    //console.log(details)
    return new Promise((resolve, response) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get().collection(collection.CART_COL).updateOne({_id:objectId(details.cart)},
        {
            $pull:{products:{item:objectId(details.product)}}
        }
        ).then((response)=>{
            resolve({removeProduct:true})
        })
      } else {
        db.get()
          .collection(collection.CART_COL)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": parseInt(details.count) },
            }
          )
          .then((response) => {
            //console.log(response);
            resolve({removeProduct:false});
          });
      }
    });
  },

  removeProduct:(cartDetails)=>{
    return new Promise((resolve,response)=>{
      db.get().collection(collection.CART_COL).updateOne({_id:objectId(cartDetails.cart)},
        {
          $pull:{products:{item:objectId(cartDetails.product)}}
        }).then((response)=>{
          resolve(true)
        })
    })
  },

  getCartTotal:(userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COL)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            }
          },
          {
            $lookup: {
              from: collection.PRODUCT_COL,
              localField: "item",
              foreignField: "_id",
              as: "product",
            }
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            }
          },
          {
            $group:{
              _id:null,
              total:{$sum:{$multiply:[{$toInt:'$quantity'},{$toInt:'$product.price'}]}}
            }
          }
        ])
        .toArray();
      console.log(total)
      resolve(total[0].total);
    });
  },

  placeOrder:(userId,products,formData)=>{
    return new Promise((resolve,reject)=>{
    let status=formData.paymentMethod==='COD'?'placed':'pending'
    let orderObject = {
      user:objectId(userId),
      products:products,
      delivery:{
        address:formData.address,
        mobile:formData.mobile,
        pincode:formData.pincode
      },
      Amount:formData.total,
      status:status
    }

    db.get().collection(collection.ORDER_COL).insertOne(orderObject).then((response)=>{
      resolve(status)
    })
  }
)}
}