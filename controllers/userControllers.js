var express = require("express");
const session = require("express-session");
var router = express.Router();
var userDetails = require("../helpers/userhelpers");
var productDetails = require("../helpers/adminhelpers");
const { render, response } = require("../app");
const { Db } = require("mongodb");
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

module.exports = {
  //Home Page
  getHome: async (req, res, next) => {
    if (req.session.logedIn) {
      
      
      let user = req.session.user;
      let category = await userDetails.getCategory();

      let cartLength = await userDetails.getCartlength(user._id);

      userDetails.productView().then((product) => {
        res.render("user/homePage", {
          user,
          userin: true,
          product,
          cartLength,
          category
        });
      });
    } else {
      res.redirect("/login");
      // res.render("user/homePage")
    }
  },

  //Login
  getLogin: (req, res) => {
    try {
      if (req.session.logedIn) {
        res.redirect("/");
      } else {
        res.render("user/userLogin", {
          loginErr: req.session.loginErr,
        });
        req.session.loginErr = false;
      }
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  postlogin: (req, res) => {
    try {
      userDetails.doLogin(req.body).then((response) => {
        if (response.status) {
          req.session.logedIn = true;
          req.session.user = response.user;

          res.redirect("/");
        } else {
          req.session.loginErr = true;
          res.redirect("/");
        }
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  //signup

  getSignup: (req, res) => {
    try {
      res.render("user/userSignup", {
        signupErr: req.session.signupErr,
      });
      req.session.signupErr = false;
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  postSignup: (req, res) => {
    userDetails.doSignup(req.body).then((response) => {
      if (response.status) {
        res.redirect("/");
      } else {
        req.session.signupErr = true;
        res.redirect("/signup");
      }
    });
  },

  //logout

  getLogout: (req, res) => {
    req.session.logedIn = null;

    res.redirect("/login");
  },

  //Products

  getViewProduct: async (req, res) => {
    try {
      let user = req.session.user;
      if (req.session.logedIn) {
        let proId = req.params.id;

        let product = await productDetails.editProduct(proId);

        res.render("user/viewProduct", {
          user,
          userin: true,
          product,
        });
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  //User Cart
  getAddCart: (req, res) => {
    try {
      let proId = req.params.id;
      let userId = req.session.user._id;

      userDetails.addToCart(userId, proId).then((response) => {
        if ((response = true)) {
          req.session.carted = true;
          res.redirect("/userCart");
        }
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  getUserCart: async (req, res) => {
    try {
      if (req.session.logedIn) {
        req.session.paymentPage = null;
        userId = req.session.user._id;
        let user = req.session.user;

        let total = await userDetails.totalPrice(userId);

        let cartLength = await userDetails.getCartlength(userId);

        userDetails.viewCart(userId).then((cartPro) => {
          res.render("user/userCart", {
            cartPro,
            user,
            userin: true,
            total,
            cartLength,
          });
        });
      }
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  postChangeItemCount: (req, res) => {
    try{
      userDetails.changeCount(req.body).then((response) => {
        res.json(response);
      });
    }catch(err){
      res.render("error/user-error.hbs", { err: err.message });
    }
    
    
  },

  getRemoveCart: (req, res) => {
    
    try{
      let proId = req.params.proId;
      let userId = req.session.user._id;
  
      userDetails.removeCartItem(proId, userId).then((response) => {
        res.redirect("/userCart");
      });
    }catch(err){
      res.render("error/user-error.hbs", { err: err.message });
    }
    
  },

  //Wish List
  postAddToWishList: (req, res) => {
    try{
      console.log(req.body);
      userDetails
        .addToWishList(req.body.userId, req.body.proId)
        .then((response) => {
          res.json(response);
        });
    }catch(err){
      res.render("error/user-error.hbs", { err: err.message }); 
    }
    
  },

  getViewWishList: (req, res) => {

    try{
      let userId = req.session.user._id;
      let user = req.session.user;
   
      userDetails.viewWishList(userId).then((response) => {
        res.render("user/wishList", {
          response,
          user,
          userin: true,
        });
      });
    }catch(err){
      res.render("error/user-error.hbs", { err: err.message }); 
    }
   
  },

  postRemoveWishList: (req, res) => {
    try{
      userDetails
      .removeWishItem(req.session.user._id, req.body.proId)
      .then((response) => {
        res.json(response);
      });
    }catch(err){
      res.render("error/user-error.hbs", { err: err.message }); 
    }
    
  },

  //Checkout
  getCheckout: async (req, res) => {
    try {
      if (req.session.paymentPage) {
        console.log("payme");

        res.redirect("/");
      } else {
        let user = req.session.user;
        let userId = req.session.user._id;

        let total = await userDetails.totalPrice(userId);

        let cartLength = await userDetails.getCartlength(userId);
        let address = await userDetails.getAddress(userId);
        let cartItems = userDetails.viewCart(userId).then((cartitem) => {
          res.render("user/checkout.hbs", {
            cartitem,
            total,
            cartLength,
            newAddress: address.deliveryAddress,
            userin: true,
            user,
          });
        });
      }
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  //Chabge Address
  postChangeAddress: (req, res) => {

    try{
      let userId = req.session.user._id;
      userDetails.deliveryAddress(userId, req.body).then((response) => {
        
        res.json(response);
      });
    }catch(err){
      res.render("error/user-error.hbs", { err: err.message });
    }
    
   

    
  },

  //Place Order
  postPlaceOrder: async (req, res) => {
   
    try {
      
      console.log('sdbfsjh');
      console.log(req.body);
      let userId = req.session.user._id;
      let payMethod = req.body.paymentMethod;
      let coupCode = req.body.coupCode;
      let total = await userDetails.totalPrice(userId);
      let products = await userDetails.forPlaceProducts(userId,payMethod);
      let address = await userDetails.getAddress(userId);

      

      userDetails
        .placeOrder(
          userId,
          total,
          products,
          payMethod,
          address.deliveryAddress,
          coupCode
        )
        .then((orderId) => {
          let orderIds = orderId.toString();

          if (!orderId.added) {
            if (orderId.wrongCoupId) {
              res.json({
                wrongCoupId: true,
              });
            } else if (payMethod == "onlinePayment") {
              userDetails.getPayPrice(orderId).then((Payprice) => {
                userDetails
                  .generateRazorPay(orderIds, Payprice)
                  .then((order) => {
                    console.log("ord: " + order.id);
                    res.json({
                      onPay: true,
                      order: order,
                    });
                  });
              });
            } else if (payMethod == "COD") {
              res.json({
                status: true,
              });
            }
          } else {
            res.json({
              added: true,
            });
          }
        });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  //Verify Payments
  postVerifyPayment: (req, res) => {
    try {
      userDetails
        .verifyPayment(req.body)
        .then(() => {
          console.log("fhjsdg");
          console.log(req.body);
          let ordId = req.body["data[receipt]"];
          let orderDrtails = {
            paymentId: req.body["response[razorpay_payment_id]"],
            orderId: req.body["response[razorpay_order_id]"],
            amountPaid: req.body["data[amount_paid]"],
            amountDue: req.body["data[amount_due]"],
          };
          userDetails.changePaymentStatus(ordId, orderDrtails).then(() => {
            console.log("changePay status");
            res.json({
              status: true,
            });
          });
        })
        .catch((err) => {
          res.json({
            status: false,
            err,
          });
        });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  //Orders
  getOrdresView: (req, res) => {
    try {
      let userId = req.session.user._id;
      let user = req.session.user

      userDetails.getOrders(userId).then((orders) => {
        
        console.log(orders);
        res.render("user/viewOrder", {
          orders, userin:true, user
        });
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  getPaymentsuccess: (req, res) => {
    try {
      req.session.paymentPage = true;

      res.render("user/paymentSuccess");
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  getCancelOrder: (req, res) => {
    try{
      let ordId = req.body.ordId
    let proId = req.body.proId
    userDetails.deleteOrder(ordId, proId).then((response) => {
      res.json(response);
    });

    }catch(err){
      res.render("error/user-error.hbs", { err: err.message });
    }
    
    
  },

  //Place Single Product
  postPlaceOrderSingle: async (req, res) => {
    try{
      let proId = req.body.proId;
      let userId = req.session.user._id;
      let payMethod = req.body.paymentMethod;
      let prices = await userDetails.getProductPrice(proId)
      let products = await userDetails.getSingleProductforPlace(proId, userId,payMethod);
      let coupCode = req.body.coupCode;
      let count = products[0].quantity
      let total = parseInt(count)  * parseInt(prices.price) 
      let address = await userDetails.getAddress(userId);
      let price = parseInt(prices.price) 
  
      userDetails
        .placeSingleProduct(
          userId,
          total,
          products,
          payMethod,
          address.deliveryAddress,
          coupCode,
          count,
          price,
          proId
        )
        .then((orderId) => {
          let orderIds = orderId.toString();
  
          if (!orderId.added) {
            if (orderId.wrongCoupId) {
              res.json({
                wrongCoupId: true,
              });
            } else if (payMethod == "onlinePayment") {
              userDetails.getPayPrice(orderId).then((Payprice) => {
                userDetails.generateRazorPay(orderIds, Payprice).then((order) => {
                  console.log("ord: " + order.id);
                  res.json({
                    onPay: true,
                    order: order,
                  });
                });
              });
            } else if (payMethod == "COD") {
              res.json({
                status: true,
              });
            }
          } else {
            res.json({
              added: true,
            });
          }
        });
    }catch(err){
      res.render("error/user-error.hbs", { err: err.message });
    }
   
  },

  //Single Product Order
  getOrderDetails:async (req, res) => {

    try{
      let proId = req.params.Id;
      let ordId = req.params.ordId;
      let user = req.session.user
      console.log(ordId);
  
      let address= await userDetails.getDeliveryAddress(ordId)
      let orderDetaisls= await userDetails.getOrderDetilsview(ordId)
      

      res.render("user/orderDetails",{userin:true, orderDetaisls,user,address} )
    }catch(err){
      res.render("error/user-error.hbs", { err: err.message });
    }
    

  },

  //Buy Single Product
  buySinglItem: async (req, res) => {
    try {
      if (req.session.paymentPage) {
        res.redirect("/");
      } else {
        let proId = req.params.id;
        let userId = req.session.user._id;
        let user = req.session.user;

        let products = await userDetails.getSingleProduct(proId, userId);
        let address = await userDetails.getAddress(userId);

        let newAddress = address.deliveryAddress;
        let total = products[0].orders[0].price * products[0].quantity
        console.log(total, "ksdjkhfksdhj");

        
        

        res.render("user/singleProductPlace", {
          products,
          total,
          newAddress,
          userin: true,
          user,
          proId,
        });
      }
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  //Profile
  getUserProfile: (req, res) => {
    try {
      let id = req.session.user._id;
      let user = userDetails.getUser(id).then((user) => {
        res.render("user/userProfile", { user });
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  getAddUserAddress: (req, res) => {
    let userId = req.session.user._id;

    userDetails.addUserAddress(userId, req.body).then((response) => {
      res.redirect("/userProfile");
    });
  },

  getAddProfilePicture: (req, res) => {
    res.render("user/addProfileImage");
  },

  //post profile image

  //

  get: (req, res) => {
    try {
      res.render('user/orderdetails.hbs',{userin:true, })
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },


  //User category
  getUserCategory:async (req,res)=>{
    try{
      let category = req.params.category
     let categoryItems= await userDetails.getUserCategory(category);

     console.log(categoryItems);
     res.render('user/userCatogory.hbs',{categoryItems, userin:true})

    } catch(err){
      res.render("error/user-error.hbs", { err: err.message });
    }
   


  },

  //getAllProducts

   getAllProducts:async (req,res)=>{
    try{

      let page = req.query.page
      let perPage =2
      let skipNo = (page -1)*perPage
      let totalDocuments=  await userDetails.countDocuments();
      let pages = Math.ceil(totalDocuments/perPage)
      
      let arr =[]

      for (let i=1; i<=pages; i++){
        arr.push(i)
      }
      
      userDetails.productViewPagination(perPage, skipNo).then((product)=>{
        res.render('user/getAllProduct.hbs',{userin:true,product,currentPage:page,totalDocuments,pages,arr})

      })
      
    }catch(err){
      res.render("error/user-error.hbs", { err: err.message });
    }

  },

  userInvoice:async (req,res)=>{
    try{

      let ordId = req.params.proId
      let deliveryAdddress = await productDetails.getDeliverAddress(ordId);
     productDetails.getOrderDetails(ordId).then((ordDetails)=>{
      console.log(ordDetails);
        res.render("user/user_invoice.hbs", {deliveryAdddress, ordDetails});
      })

    }catch(err){
      res.render("error/user-error.hbs", { err: err.message }); 
    }
    

  },

  //Search

  searchResult:async (req,res)=>{
    try{
    let  searchKey= req.query.searchKey
    let product =await userDetails.getSearchResult(searchKey)
    res.render("user/searchResult",{product, userin:true})

    }catch(err){
      res.render("error/user-error.hbs", { err: err.message }); 
    }

  }
};
