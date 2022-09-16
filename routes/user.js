var express = require('express');
const productHelpers = require('./helpers/product-helpers');
const userHelpers = require('./helpers/user-helpers');
var router = express.Router();

const verifyLogin=(req,res,next)=>{
  if (req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', async function(req, res, next) {
  let user = req.session.user
  let cartCount = null
  if(req.session.user){
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  
  productHelpers.getAllProducts().then((products)=>{
    res.render('user/view-products', {products,user,cartCount,admin:false });
  });
  
});

router.get('/login',(req,res)=>{
  if(req.session.loggedin){
    res.redirect('/');
  }
  else{
    res.render('user/login',{loginErr:req.session.loginErr});
    req.session.loginErr = false;
  }
});

router.get('/signup',(req,res)=>{
  res.render('user/signup');
});

router.post('/signup',(req,res)=>{
  //console.log(req.body)
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
    req.session.loggedIn=true;
    req.session.user = response;
  })
});

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if (response.status){
      req.session.loggedIn =true;
      req.session.user = response.user;
      res.redirect('/');
    }else{
      req.session.loginErr = "Invalid username or password";
      res.redirect('/login');
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/login');
});

router.get('/cart',verifyLogin,async(req,res)=>{
  let total = await userHelpers.getCartTotal(req.session.user._id)
  userHelpers.getCartProducts(req.session.user._id).then((cartProds)=>{
    //console.log(cartProds)
    let cartCount = cartProds.length
    res.render('user/cart',{cartProds,user:req.session.user,cartCount,total});
  })
});

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  //console.log(req.session.id);
  //console.log(req.session.user);
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
    //res.redirect('/')
  })
})

router.post('/change-product-quantity',(req,res)=>{
  userHelpers.changeProductQuantity(req.body).then((response)=>{
    res.json(response)
  })
})

router.post('/remove-product',(req,res)=>{
  userHelpers.removeProduct(req.body).then((response)=>{
    res.json(response)
  })
})

router.get('/place-order',verifyLogin,async(req,res)=>{
  let total=await userHelpers.getCartTotal(req.session.user._id)
  console.log(total)
  userHelpers.getCartProducts(req.session.user._id).then((cartProds)=>{
    //console.log(cartProds)
    res.render('user/place-order',{cartProds,user:req.session.user,total});
  })
})
module.exports = router;
