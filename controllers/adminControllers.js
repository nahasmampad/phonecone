var express = require("express");
var router = express.Router();
var productDetails = require("../helpers/adminhelpers");
const multer = require("multer");
const { Db } = require("mongodb");
var isJson = require('is-json')
var json2xls = require('json2xls')
var fs = require('fs')


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

module.exports = {
  //Home Page
  getHomePage: async function (req, res, next) {
    try {
      if (req.session.adminLogin) {
        let totalProduct = await productDetails.getTotalProduct();
        let totalUsers = await productDetails.getTotalUsers();
        let totalOrder = await productDetails.getTotalOrder();
        let totalCategor = await productDetails.getTotalCategory();
        let statusCount = await productDetails.getStatusCount();
        let categorySales = await productDetails.getCategorySales();
        let salesReport = await productDetails.downLoadSalesReport();
        


        res.render("admin/index", {
          adminIn: true,
          dashBord: true,
          totalProduct,
          totalUsers,
          totalOrder,
          totalCategor,
          statusCount,
          categorySales,
          salesReport


        });
      } else {
        res.redirect("/admin/adminLogin");
        console.log("else");
      }
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  //Product Management
  getProducts: async (req, res) => {
    try {
      if (req.session.adminLogin) {
        let categoryList = await productDetails.getCategory();
        productDetails.getAllproduct().then((product) => {
          res.render("admin/products", {
            categoryList,
            product,
            adminIn: true,
            productPgae: true,
          });
        });
      } else {
        res.redirect("/admin/adminLogin");
      }
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  getAddProduct: async (req, res) => {
    try {
      if (req.session.adminLogin) {
        let categoryList = await productDetails.getCategory();
        console.log(categoryList);
        res.render("admin/addproduct", { categoryList });
      } else {
        res.redirect("/admin/adminLogin");
      }
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  getDeleteProduct: (req, res) => {
    try {
      if (req.session.adminLogin) {
        let proId = req.query.id;
        productDetails.deleteProduct(proId).then((response) => {
          res.redirect("/admin/products");
        });
      } else {
        res.redirect("/admin/adminLogin");
      }
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },
 
  getEditProduct: async (req, res) => {
    try {
      let proId = req.query.id;
      if (req.session.adminLogin) {
        console.log(proId);
        let product = await productDetails.editProduct(proId);

        res.render("admin/editProduct", { product });
      } else {
        res.redirect("/admin/adminLogin");
      }
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  postEditProduct: (req, res) => {
    try {
      let proId = req.params.id;
      console.log(proId);
      console.log(req.body);

      productDetails.updateProduct(proId, req.body).then((response) => {
        res.redirect("/admin/products");
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  getProductView: async (req, res) => {
    try {
      if (req.session.adminLogin) {
        let proId = req.params.id;

        let product = await productDetails.editProduct(proId);

        res.render("admin/productView", { adminIn: true, product });
      }
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  getAdminLogin: (req, res) => {
    try {
      if (req.session.adminLogin) {
        res.redirect("/admin");
      } else {
        res.render("admin/adminLogin", { loginErr: req.session.adminloginErr });
        req.session.adminloginErr = false;
      }
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  postAdminLogin: (req, res) => {
    try {
      adminData = req.body;
      console.log(adminData);

      productDetails.doLoginAdmin(adminData).then((response) => {
        if (response.status) {
          req.session.adminLogin = true;
          res.redirect("/admin");
          console.log("post");
        } else {
          req.session.adminloginErr = true;
          res.redirect("/admin/adminLogin");
          console.log("post else");
        }
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  //addProductAditionalDetails

  addProductAditionalDetails:(req,res)=>{
    try{
      let newDetails = req.body
      let proId = req.params.id
      productDetails.addProductAditionalDetails(proId, newDetails)
      res.redirect('/admin/editProduct')
    }catch(err){
      res.render("error/user-error.hbs", { err: err.message });
    }
  },






  getAdminSignout: (req, res) => {
    try {
      req.session.adminLogin = null;
      res.redirect("/admin/adminLogin");
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  getOrders: (req, res) => {
    try {
      productDetails.getOrders().then((orders) => {
        console.log("orders");
        console.log(orders);

        res.render("admin/orders", {
          orders,
          adminIn: true,
          product: true,
          orderPage: true,
        });
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  getViewOrdersDetails: async (req, res) => {
    try {
      let ordId = req.params.ordId;
      let deliveryAdddress = await productDetails.getDeliverAddress(ordId);

      productDetails.getOrderDetails(ordId).then((ordDetails) => {
        // if (status == "PLACED") {
        //   var progressBar = {
        //     placed: 33,
        //     shipped: 0,
        //     delivery: 0,
        //     status: "PLACED",
        //     color: "secondary",
        //   };
        // } else if (status == "SHIPPED") {
        //   var progressBar = {
        //     placed: 33,
        //     shipped: 33,
        //     delivery: 0,
        //     status: "SHIPPED",
        //     color: "primary",
        //   };
        // } else {
        //   var progressBar = {
        //     placed: 33,
        //     shipped: 33,
        //     delivery: 34,
        //     status: "DELIVERD",
        //     color: "success",
        //   };
        // }

        let ordId = ordDetails[0]._id;

        res.render("admin/viewEachOrderDetils.hbs", {
          ordDetails,
          ordId,
          adminIn: true,
          orderPage: true,
          deliveryAdddress,
        });
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  postStatusShipped: (req, res) => {
    try {
      console.log(req.body);

      let ordId = req.body.ordId;
      let proId = req.body.proId;
      productDetails.statusShipped(ordId, proId).then((response) => {
        res.json({ response });
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  postStatusPlaced: (req, res) => {
    try {
      let ordId = req.body.ordId;
      let proId = req.body.proId;
      productDetails.stausePlaced(ordId, proId).then((response) => {
        res.json({ response });
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  postStatusDeliverd: (req, res) => {
    try {
      let ordId = req.body.ordId;
      let proId = req.body.proId;
      productDetails.stauseDeliverd(ordId, proId).then((response) => {
        res.json({ response });
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  getOffers: async (req, res) => {
    try {
      let coupens = await productDetails.getCoupens();

      res.render("admin/offers", { adminIn: true, offerPage: true, coupens });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  postAddCoupen: (req, res) => {
    try {
      productDetails.addCoupen(req.body).then((response) => {
        res.redirect("/admin/offers");
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  postDeleteCoupen: (req, res) => {
    try {
      productDetails.deleteCoupen(req.body.coupId).then((response) => {
        res.json({ delete: true });
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  //User Management
  getUserDeatils: (req, res) => {
    try {
      productDetails.getUserDetails().then((userDetials) => {
        res.render("admin/userDetails", {
          adminIn: true,
          userPage: true,
          userDetials,
        });
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  postChangeUserStatus: (req, res) => {
    try {
      productDetails.changeUserStatus(req.body.userId).then((response) => {
        res.json(response);
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  //Category

  postAddCategory: (req, res) => {
    try {
      productDetails.addCategory(req.body).then((response) => {
        console.log(response, "fhsjdfghj");
        res.json(response);
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  getCategoryItems: async (req, res) => {
    try {
      let categoryName = req.params.item;

      let product = await productDetails.getCategoryItems(categoryName);
      res.render("admin/categoryItems.hbs", {
        product,
        adminIn: true,
        orderPage: true,
      });
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  //Search
  getSearch: async (req, res) => {
    try {
      let key = req.query.searchKey;
      let product = await productDetails.getProductSearch(key);
      res.render("admin/productSerchResult.hbs", {
        adminIn: true,
        productPgae: true,
        product,
      });
    } catch (err) {}
  },

  //Download Invoice
  getDownloadInvoice:async (req, res) => {
    try {
      
      let ordId = req.params.id
      let deliveryAdddress = await productDetails.getDeliverAddress(ordId);
     productDetails.getOrderDetails(ordId).then((ordDetails)=>{
      console.log(ordDetails);
        res.render("admin/invoice", {deliveryAdddress, ordDetails});
      })
      
      
    } catch (err) {
      res.render("error/user-error.hbs", { err: err.message });
    }
  },

  //totalRevenueChart
  totalRevenueChart:(req,res)=>{
    productDetails.totalRevenueChart().then((response)=>{

      console.log();
      res.json(response)

    })
  },

  //Download Sales Report
  downLoadSalesReport:async (req,res)=>{
    let salesReport = await productDetails.downLoadSalesReport();
    
    salesReport = JSON.stringify(salesReport);
    
    if(isJson(salesReport)){
  
      var fileName = Date.now() + "sales report.xlsx"

      var xls = json2xls(JSON.parse(salesReport) );
      fs.writeFileSync(fileName, xls, 'binary');

      res.download(fileName,(err)=>{
        if(err){
          fs.unlinkSync(fileName)
          console.log('unable to download this file');
        }else{
          fs.unlinkSync(fileName)
        }
      })
    }else{
      console.log('no');
    }


  }
};
