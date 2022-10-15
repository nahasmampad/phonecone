const controllers = require("../controllers/adminControllers");
var express = require("express");
var router = express.Router();
var productDetails = require("../helpers/adminhelpers");
const multer = require("multer");
const { Db } = require("mongodb");

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
router.get("/products", controllers.getProducts);
router.get("/addProduct", controllers.getAddProduct);

//Add Product
router.post("/addProduct", upload.array("image", 4), (req, res) => {
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
router.get("/deleteProduct", controllers.getDeleteProduct);

//Edit Prdouct Page
router.get("/editProduct", controllers.getEditProduct);
router.post("/editProduct/:id", controllers.postEditProduct);
router.post('/addProductAditionalDetails/:id', controllers.addProductAditionalDetails)

router.get("/productView:id", controllers.getProductView);

router.get("/adminLogin", controllers.getAdminLogin);

router.post("/adminLogin", controllers.postAdminLogin);

router.get("/adminSignout", controllers.getAdminSignout);

router.get("/orders", controllers.getOrders);

router.get("/viewOrderDetails:ordId", controllers.getViewOrdersDetails);

router.post("/stauseShipped", controllers.postStatusShipped);

router.post("/stausePlaced", controllers.postStatusPlaced);

router.post("/stauseDeliverd", controllers.postStatusDeliverd);

router.get("/offers", controllers.getOffers);

router.post("/addCoupen", controllers.postAddCoupen);

router.post("/deleteCoupen", controllers.postDeleteCoupen);

router.get("/userDetails", controllers.getUserDeatils);

router.post("/changeUserStatus", controllers.postChangeUserStatus);

router.post("/addCategory", controllers.postAddCategory);

router.get("/getCategoryItems:item", controllers.getCategoryItems);

router.get("/searchProduct", controllers.getSearch);

//Download Invoice
router.get('/downLoadInvoice/:id',controllers.getDownloadInvoice)

//totalRevenueChart
router.post('/totalRevenueChart', controllers.totalRevenueChart)

//Download Sales Report
router.get('/downLoadSalesReport',controllers.downLoadSalesReport)

module.exports = router;
