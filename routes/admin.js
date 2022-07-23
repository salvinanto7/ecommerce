var express = require('express');
const productHelpers = require('./helpers/product-helpers');
var router = express.Router();
var fs = require('fs'); 

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    res.render('admin/view-products',{admin:true,products})
  })
 
});

router.get('/add-products',(req,res)=>{
  res.render('admin/add-products',{admin:true});
});

router.post('/add-products',(req,res)=>{
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

router.get('/delete-product/:id',(req,res)=>{
  let prodId = req.params.id
  console.log(prodId)
  productHelpers.deleteProduct(prodId).then((response)=>{
    res.redirect('/admin')
  })
});

router.get('/edit-product/:id',async(req,res)=>{
  let prod = await productHelpers.getProductDetails(req.params.id)
  console.log(prod)
  res.render('admin/edit-product',{prod})
});

router.post('edit-product/:id',(req,res)=>{
  productHelpers.updateProductDetails(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
  })
  
  });
module.exports = router;
