const userControllers = require("../controllers/userControllers");

var express = require("express");
const session = require("express-session");
var router = express.Router();
var userDetails = require("../helpers/userhelpers");

const { render, response } = require("../app");
const { Router } = require("express");
const multer = require("multer");

// Multer module defining
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/profileImage");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

/* GET users listing. */
router.get("/", userControllers.getHome);

//login

router.get("/login", userControllers.getLogin);
router.post("/login", userControllers.postlogin);

//signup
router.get("/signup", userControllers.getSignup);
router.post("/signup", userControllers.postSignup);
router.get("/logout", userControllers.getLogout);


//View Product
router.get("/viewProduct/:id", userControllers.getViewProduct);
//Category

//User cart
router.get("/addToCart/:id", userControllers.getAddCart);
router.get("/userCart", userControllers.getUserCart);
router.post("/changeCount", userControllers.postChangeItemCount);
router.get("/removeCartItem/:proId", userControllers.getRemoveCart);

//Wish List
router.post("/addToWishList", userControllers.postAddToWishList);
router.get("/viewWishList", userControllers.getViewWishList);
router.post("/removeWishItems", userControllers.postRemoveWishList);
router.get("/checkout", userControllers.getCheckout);
router.post("/changeAddress", userControllers.postChangeAddress);

//Place Oreder
router.post("/placeOrder", userControllers.postPlaceOrder);

//Verify Payment
router.post("/verifyPayment", userControllers.postVerifyPayment);

//View Order
router.get("/ordersView", userControllers.getOrdresView);
router.get("/paymentSuccess", userControllers.getPaymentsuccess);
router.post("/deleteOrders", userControllers.getCancelOrder);
router.get("/orderDetails/:Id/:ordId", userControllers.getOrderDetails);
router.get("/userProfile", userControllers.getUserProfile);

//Buy Single Product
router.get("/buySigleItem/:id", userControllers.buySinglItem);
router.post("/placeOrderSingle", userControllers.postPlaceOrderSingle);
router.post("/addUserAddress", userControllers.getAddUserAddress);
router.get("/addProfileImage", userControllers.getAddProfilePicture);
router.post("/addProfileImage", upload.array("image", 1), (req, res) => {
  const Images = [];
  for (i = 0; i < req.files.length; i++) {
    Images[i] = req.files[i].filename;
  }

  req.body.image = Images;
  let userId = req.session.user._id;
  let image = req.body.image;

  userDetails.addProfileImage(userId, image).then((response) => {
    res.redirect("/userProfile");
  });
});


//Category
router.get('/userCatogory:category',userControllers.getUserCategory)

//test

router.get("/test", userControllers.get);

//Get All Product for Pagination

router.get("/getAllProducts", userControllers.getAllProducts)

// User Invoice
router.get('/downLoadInvoice/:proId',userControllers.userInvoice)

//Search

router.get('/searchResult', userControllers.searchResult)

router.post('/tester', (req,res)=>{
  console.log('bhsjasgjgj')
  console.log(req.body)
})

module.exports = router;
