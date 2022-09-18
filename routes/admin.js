var express = require('express');
const productHelpers = require('./helpers/product-helpers');
const adminHelpers  = require('./helpers/admin-helpers');
var router = express.Router();
var fs = require('fs'); 

const verifyLogin=(req,res,next)=>{
  if (req.session.admin!=null){
  if (req.session.admin.loggedIn){
    next()
  }
  }else{
    res.redirect('/admin/login')
  }
}

/* GET admin listing. */
router.get('/',verifyLogin,(req, res, next)=>{
  productHelpers.getAllProducts().then((products)=>{
    res.render('admin/view-products',{admin:true,products,user:req.session.admin})
  })
 
});


router.get('/login',(req,res)=>{
  if(req.session.admin){
    res.redirect('/');
  }
  else{
    console.log("yeah right")
    res.render('admin/login',{admin:true,loginErr:req.session.adminLoginErr});
    req.session.adminLoginErr = false;
  }
});


router.post('/login',(req,res)=>{
  console.log("pst request called")
  adminHelpers.Login(req.body).then((response)=>{
    if (response.status){
      req.session.admin = response.admin;
      req.session.admin.loggedIn =true;
      res.redirect('/admin');
    }else{
      req.session.adminLoginErr = "Invalid admin username or password";
      res.redirect('/admin/login');
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.admin=null;
  res.redirect('/admin/login');
});

router.get('/add-products',verifyLogin,(req,res)=>{
  res.render('admin/add-products',{admin:true});
});

router.post('/add-products',verifyLogin,(req,res)=>{
  console.log(req.body);
  console.log(req.files.image);

  productHelpers.addProduct(req.body,(id)=>{
    let image = req.files.image;
    //console.log(image);
    //console.log(image.data);
    fs.writeFile("./public/product-images/"+id+'.jpg', image.data, 'binary', function(err) { 
    console.log("The file was saved!");

    
  });
  res.redirect('/admin');
});

});

router.get('/delete-product/:id',verifyLogin,(req,res)=>{
  let prodId = req.params.id
  console.log(prodId)
  productHelpers.deleteProduct(prodId).then((response)=>{
    res.redirect('/admin')
  })
});

router.get('/edit-product/:id',verifyLogin,async(req,res)=>{
  let prod = await productHelpers.getProductDetails(req.params.id)
  //console.log(prod)
  res.render('admin/edit-product',{prod})
});

router.post('/edit-product/:id',verifyLogin,(req,res)=>{
  //console.log(req)
  //console.log(req.files.Image)
  productHelpers.updatePrdouctDetails(req.params.id,req.body).then(()=>{
    //console.log(req.files.image)
    if (req.files.image){
      //console.log("yes");
      let image = req.files.image;
      //console.log(image.data)
      fs.writeFile("./public/product-images/"+req.params.id+'.jpg', image.data, 'binary', function(err) { 
        console.log("The file was updated!");
    })   
    }
    res.redirect('/admin');
  })
  
  });
module.exports = router;
