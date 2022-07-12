var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let products = [
    {
      name:"Macbook Pro 16'",
      category:"laptops",
      description:"best in class",
      image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp-spacegray-select-202206?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653493200207"
    },
    {
      name:"Macbook Pro 16'",
      category:"laptops",
      description:"best in class",
      image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp-spacegray-select-202206?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653493200207"
    },
    {
      name:"Macbook Pro 16'",
      category:"laptops",
      description:"best in class",
      image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp-spacegray-select-202206?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653493200207"
    },
    {
      name:"Macbook Pro 16'",
      category:"laptops",
      description:"best in class",
      image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp-spacegray-select-202206?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653493200207"
    }
  ]
  res.render('index', { title: 'Express',products,admin:false });
});

module.exports = router;
