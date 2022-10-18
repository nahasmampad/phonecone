const controllers = require("../controllers/adminControllers");
var express = require("express");
var router = express.Router();
var productDetails = require("../helpers/adminhelpers");
const multer = require("multer");
const { Db } = require("mongodb");

function verifyLogin(req,res,next){
  if(req.session.adminLogin){  
    next()
  }else{
    res.redirect('/admin/adminLogin')
  }
}

// Multer module defining
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/productimg");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

/* GET home page. */
router.get("/", controllers.getHomePage);

//Product Management
router.get("/products",verifyLogin, controllers.getProducts);
router.get("/addProduct",verifyLogin, controllers.getAddProduct);

//Add Product
router.post("/addProduct",verifyLogin, upload.array("image", 4), (req, res) => {
  try {
    const Images = [];
    for (i = 0; i < req.files.length; i++) {
      Images[i] = req.files[i].filename;
    }

    req.body.image = Images;

    productDetails.addProduct(req.body).then((id) => {
      res.redirect("/admin/products");
    });
  } catch (err) {
    res.render("error/user-error.hbs", { err: err.message });
  }
});

//Delete Product
router.get("/deleteProduct",verifyLogin, controllers.getDeleteProduct);

//Edit Prdouct Page
router.get("/editProduct",verifyLogin, controllers.getEditProduct);
router.post("/editProduct/:id",verifyLogin, controllers.postEditProduct);
router.post('/addProductAditionalDetails/:id',verifyLogin, controllers.addProductAditionalDetails)

router.get("/productView:id",verifyLogin, controllers.getProductView);

router.get("/adminLogin", controllers.getAdminLogin);

router.post("/adminLogin", controllers.postAdminLogin);

router.get("/adminSignout",verifyLogin, controllers.getAdminSignout);

router.get("/orders",verifyLogin, controllers.getOrders);

router.get("/viewOrderDetails:ordId",verifyLogin, controllers.getViewOrdersDetails);

router.post("/stauseShipped",verifyLogin, controllers.postStatusShipped);

router.post("/stausePlaced",verifyLogin, controllers.postStatusPlaced);

router.post("/stauseDeliverd", controllers.postStatusDeliverd);

router.get("/offers",verifyLogin, controllers.getOffers);

router.post("/addCoupen",verifyLogin, controllers.postAddCoupen);

router.post("/deleteCoupen",verifyLogin, controllers.postDeleteCoupen);

router.get("/userDetails",verifyLogin, controllers.getUserDeatils);

router.post("/changeUserStatus",verifyLogin, controllers.postChangeUserStatus);

router.post("/addCategory",verifyLogin, controllers.postAddCategory);

router.get("/getCategoryItems:item",verifyLogin, controllers.getCategoryItems);

router.get("/searchProduct",verifyLogin, controllers.getSearch);

//Download Invoice
router.get('/downLoadInvoice/:id',verifyLogin,controllers.getDownloadInvoice)

//totalRevenueChart
router.post('/totalRevenueChart',verifyLogin, controllers.totalRevenueChart)

//Download Sales Report
router.get('/downLoadSalesReport',verifyLogin,controllers.downLoadSalesReport)

module.exports = router;
