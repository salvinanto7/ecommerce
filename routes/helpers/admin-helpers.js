var db = require("../../config/connection");
var collection = require("../../config/collection");
var bcrypt = require("bcrypt");
const { ObjectID } = require("bson");
const e = require("express");
const { response } = require("express");
const { ConnectionClosedEvent } = require("mongodb");
var objectId = require("mongodb").ObjectId;

module.exports={

    Login: (adminData) => {
        console.log(adminData)
        let response = {};
        return new Promise(async (resolve, reject) => {
          let admin = await db
            .get()
            .collection(collection.ADMIN_COL)
            .findOne({ email: adminData.email });
        
            console.log(admin)

          if (admin) {
            bcrypt.compare(adminData.password, admin.password).then((state) => {
                console.log("bcrypt error :", state)
              if (state) {
                console.log("admin login success");
                response.admin = admin;
                response.status = true;
                resolve(response);
              } else {
                console.log("admin login failed");
                resolve({ status: false });
              }
            });
          } else {
            console.log("admin credentials doesn't match");
            resolve({ status: false });
          }
        });
      },

}