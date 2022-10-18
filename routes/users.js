const userControllers = require("../controllers/userControllers");

var express = require("express");
const session = require("express-session");
var router = express.Router();
var userDetails = require("../helpers/userhelpers");

const { render, response } = require("../app");
const { Router } = require("express");
const multer = require("multer");
function verifyLoginUser(req,res,next){
  if(req.session.logedIn){  
    next()
  }else{
    res.redirect('/login')
  }
}

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
router.get("/addToCart/:id",verifyLoginUser, userControllers.getAddCart);
router.get("/userCart",verifyLoginUser,  userControllers.getUserCart);
router.post("/changeCount",verifyLoginUser,  userControllers.postChangeItemCount);
router.get("/removeCartItem/:proId",verifyLoginUser,  userControllers.getRemoveCart);

//Wish List
router.post("/addToWishList",verifyLoginUser,  userControllers.postAddToWishList);
router.get("/viewWishList",verifyLoginUser,  userControllers.getViewWishList);
router.post("/removeWishItems",verifyLoginUser,  userControllers.postRemoveWishList);
router.get("/checkout",verifyLoginUser,  userControllers.getCheckout);
router.post("/changeAddress",verifyLoginUser,  userControllers.postChangeAddress);

//Place Oreder
router.post("/placeOrder",verifyLoginUser,  userControllers.postPlaceOrder);

//Verify Payment
router.post("/verifyPayment",verifyLoginUser,  userControllers.postVerifyPayment);

//View Order
router.get("/ordersView",verifyLoginUser,  userControllers.getOrdresView);
router.get("/paymentSuccess",verifyLoginUser,  userControllers.getPaymentsuccess);
router.post("/deleteOrders",verifyLoginUser,  userControllers.getCancelOrder);
router.get("/orderDetails/:Id/:ordId",verifyLoginUser,  userControllers.getOrderDetails);
router.get("/userProfile",verifyLoginUser,  userControllers.getUserProfile);

//Buy Single Product
router.get("/buySigleItem/:id",verifyLoginUser,  userControllers.buySinglItem);
router.post("/placeOrderSingle",verifyLoginUser,  userControllers.postPlaceOrderSingle);
router.post("/addUserAddress",verifyLoginUser,  userControllers.getAddUserAddress);
router.get("/addProfileImage",verifyLoginUser,  userControllers.getAddProfilePicture);
router.post("/addProfileImage",verifyLoginUser,  upload.array("image", 1), (req, res) => {
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
router.get('/userCatogory:category',verifyLoginUser, userControllers.getUserCategory)

//test

router.get("/test", userControllers.get);

//Get All Product for Pagination

router.get("/getAllProducts",verifyLoginUser,  userControllers.getAllProducts)

// User Invoice
router.get('/downLoadInvoice/:proId',verifyLoginUser, userControllers.userInvoice)

//Search

router.get('/searchResult', userControllers.searchResult)

router.post('/tester', (req,res)=>{
  console.log('bhsjasgjgj')
  console.log(req.body)
})

module.exports = router;
