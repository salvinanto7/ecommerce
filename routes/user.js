var express = require('express');
const productHelpers = require('./helpers/product-helpers');
const userHelpers = require('./helpers/user-helpers');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    res.render('user/view-products', {products,admin:false });
  });
  
});

router.get('/login',(req,res)=>{
  res.render('user/login');
});

router.get('/signup',(req,res)=>{
  res.render('user/signup');
});

router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
  })
})

module.exports = router;
