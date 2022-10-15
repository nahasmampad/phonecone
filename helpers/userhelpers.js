var db = require("../config/conection");
var user_collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { response, options } = require("../app");
var objectId = require("mongodb").ObjectId;
const Razorpay = require("razorpay");
const { resolve } = require("node:path");
const { rejects } = require("node:assert");
var instance = new Razorpay({
  key_id: process.env.RPAYID,
  key_secret: process.env.RPAYKEY,
});

const client = require('twilio')
('ACafa94c44646f0279c815786aa795a212','3e8d3662c447c1efd908813a21c69630');

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {

      let user = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .findOne({ email: userData.email });

      if (!user) {
        //OTP
        // resolve({userData:userData})

        userData.password = await bcrypt.hash(userData.password, 10);

        db.get().collection(user_collection.USER_COLLECTION).insertOne(userData)
          .then;
        resolve({ status: true });





        
      } else {
        resolve({ status: false });
      }
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};

      let user = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .findOne({ email: userData.email });

      if (user && user.user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            resolve({ status: false });
          }
        });
      } else {
        resolve({ status: false });
      }
    });
  },

  productView: () => {
    return new Promise((resolve, reject) => {
      let product = db
        .get()
        .collection(user_collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(product);
    });
  },

  addToCart: (userId, proId) => {
    let cartObj = {
      product: objectId(proId),
      count: 1,
    };

    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId), cartItems: { $exists: true } });
      if (userCart) {
        let proExist = userCart.cartItems.findIndex(
          (product) => product.product == proId
        );
        console.log(proExist);

        if (proExist > -1) {
          resolve((carted = true));
        } else {
          db.get()
            .collection(user_collection.USER_COLLECTION)
            .updateOne(
              { _id: objectId(userId) },
              { $push: { cartItems: cartObj } }
            );
          resolve((carted = true));
        }
      } else {
        cartProId = objectId(proId);

        db.get()
          .collection(user_collection.USER_COLLECTION)
          .updateOne(
            { _id: objectId(userId) },
            { $set: { cartItems: [cartObj] } }
          );

        resolve((carted = true));
      }
    });
  },

  viewCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartProduct = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(userId) },
          },
          {
            $unwind: "$cartItems",
          },
          {
            $project: {
              product: "$cartItems.product",
              count: "$cartItems.count",
            },
          },
          {
            $lookup: {
              from: user_collection.PRODUCT_COLLECTION,
              localField: "product",
              foreignField: "_id",
              as: "cartItems",
            },
          },
        ])
        .toArray();

      console.log(cartProduct);
      resolve(cartProduct);
    });
  },

  changeCount: (details) => {
    let count = parseInt(details.count);
    console.log(count);
    return new Promise(async (resolve, reject) => {
      // cartcount
      let cartCount = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(userId) },
          },
          {
            $unwind: "$cartItems",
          },
          {
            $project: {
              count: "$cartItems.count",
            },
          },
        ])
        .toArray();

      let cartCountis = cartCount[0].count;

      // cart count end

      if (count == -1 && cartCountis == 1) {
        db.get()
          .collection(user_collection.USER_COLLECTION)
          .updateOne(
            { _id: objectId(details.userId) },
            { $pull: { cartItems: { product: objectId(details.proId) } } }
          );
        resolve((removed = true));
      } else {
        db.get()
          .collection(user_collection.USER_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.userId),
              "cartItems.product": objectId(details.proId),
            },
            {
              $inc: { "cartItems.$.count": count },
            }
          );
        resolve((countchange = true));
      }
    });
  },

  removeCartItem: (proId, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(user_collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          { $pull: { cartItems: { product: objectId(proId) } } }
        );
      resolve((removed = true));
    });
  },

  totalPrice: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId), cartItems: { $exists: true } });

      if (cart) {
        let length = cart.cartItems.length;
        if (length > 0) {
          let totalAmount = await db
            .get()
            .collection(user_collection.USER_COLLECTION)
            .aggregate([
              {
                $match: { _id: objectId(userId) },
              },
              {
                $unwind: "$cartItems",
              },
              {
                $project: {
                  product: "$cartItems.product",
                  count: "$cartItems.count",
                },
              },
              {
                $lookup: {
                  from: user_collection.PRODUCT_COLLECTION,
                  localField: "product",
                  foreignField: "_id",
                  as: "cartItems",
                },
              },
              {
                $project: {
                  product: 1,
                  count: 1,
                  cartItems: { $arrayElemAt: ["$cartItems", 0] },
                },
              },

              {
                $group: {
                  _id: null,
                  total: {
                    $sum: { $multiply: ["$count", "$cartItems.price"] },
                  },
                },
              },
            ])
            .toArray();

          console.log(totalAmount);
          resolve(totalAmount[0].total);
        } else {
          resolve((total = 0));
        }
      } else {
        resolve((total = 0));
      }
    });
  },

  getCartlength: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) });
      console.log(user);
      if (user.cartItems) {
        let cartLength = user.cartItems.length;
        resolve(cartLength);
      } else {
        resolve((cartLength = 0));
      }
    });
  },

  addToWishList: (userId, proIds) => {
    let proId = objectId(proIds);
    let wishListItem = {
      productId: proId,
    };
    return new Promise(async (resolve, reject) => {
      console.log("wish start");
      let wishList = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId), wishList: { $exists: true } });

      if (wishList) {
        console.log("wishlist und");
        let proExist = wishList.wishList.findIndex(
          (product) => product.productId == proIds
        );

        if (proExist > -1) {
          console.log("aadyham und");
          resolve((wishListExist = true));
        } else {
          console.log("added");
          db.get()
            .collection(user_collection.USER_COLLECTION)
            .updateOne(
              { _id: objectId(userId) },
              { $push: { wishList: wishListItem } }
            );
          resolve((wishListExist = true));
        }
      } else {
        console.log("aadyham undundakki");

        db.get()
          .collection(user_collection.USER_COLLECTION)
          .updateOne(
            { _id: objectId(userId) },
            { $set: { wishList: [wishListItem] } }
          );
        resolve((wishListCreated = true));
      }
    });
  },

  viewWishList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wishListPro = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(userId) },
          },
          {
            $unwind: "$wishList",
          },
          {
            $project: {
              product: "$wishList.productId",
            },
          },
          {
            $lookup: {
              from: user_collection.PRODUCT_COLLECTION,
              localField: "product",
              foreignField: "_id",
              as: "wishList",
            },
          },
        ])
        .toArray();
      console.log("wishListPro");

      resolve(wishListPro);
    });
  },

  removeWishItem: (userId, proId) => {
    console.log(userId, proId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(user_collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          { $pull: { wishList: { productId: objectId(proId) } } }
        );
      resolve((removed = true));
    });
  },

  deliveryAddress: (userId, data) => {
   

    return new Promise((resolve, reject) => {
      db.get()
        .collection(user_collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          {
            $set: {
              deliveryAddress: data,
            },
          }
        );

      resolve((addressAdd = true));
    });
  },

  forPlaceProducts: (userId, payMethod) => {
    return new Promise(async (resolve, reject) => {
      let status = payMethod == "COD" ? "PLACED" : "PENDING";

      let product = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(userId) },
          },

          {
            $unwind: "$cartItems",
          },
          {
            $project: {
              proId: "$cartItems.product",
              quantity: "$cartItems.count",
              status: status,
              _id: 0,
            },
          },
        ])
        .toArray();

      
      console.log(product);
      resolve(product);
    });
  },

  placeOrder: (userId, price, products, payMethod, DeliAddress, coupId) => {
    return new Promise(async (resolve, reject) => {
      
      if (coupId) {
        let disPrize = await db
          .get()
          .collection(user_collection.COUPEN_COLLECTIO)
          .findOne({ coupenCode: coupId });

        if (disPrize && disPrize.minPurchase <= price) {
          console.log("id sheriyan");
          let disAmount = disPrize.disAmount;
          let newPrize = price - disAmount;

          console.log("newPrize", newPrize);

          let status = payMethod == "COD" ? "PLACED" : "PENDING";
          let today = new Date();
          let date =
            today.getFullYear() +
            "-" +
            (today.getMonth() + 1) +
            "-" +
            today.getDate();
          let time =
            today.getHours() +
            ":" +
            today.getMinutes() +
            ":" +
            today.getSeconds();
          let dateTime = date + ", " + time;

          let orderObj = {
            ORDId :"ORD"+ Math.floor(Math.random() * 100000 * 10),
            dateAndTime: dateTime,
            userId: objectId(userId),
            paymentMetohd: payMethod,
            totalAmount: newPrize,
            products: products,
            deliveryAddress: DeliAddress,
            coupen: coupId,
            groupOrder:true,
            date: today

          };

          let address = await db
            .get()
            .collection(user_collection.USER_COLLECTION)
            .findOne({
              _id: objectId(userId),
              deliveryAddress: { $exists: true },
            });

          if (address) {
            db.get()
              .collection(user_collection.DELIVERY_COLLECTION)
              .insertOne({ productDetails: orderObj })
              .then((result) => {
                id = result.insertedId;
                resolve(id);
              });

            db.get()
              .collection(user_collection.USER_COLLECTION)
              .updateOne(
                { _id: objectId(userId) },
                { $unset: { cartItems: "" } }
              );
          } else {
            console.log("else");
            resolve((added = true));
          }
        } else {
          console.log("id sheriyall");

          resolve({ wrongCoupId: true });
        }
      } else {
        console.log("coup illa");
        let status = payMethod == "COD" ? "PLACED" : "PENDING";
        let today = new Date();
        let date =
          today.getFullYear() +
          "-" +
          (today.getMonth() + 1) +
          "-" +
          today.getDate();
        let time =
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds();
        let dateTime = date + ", " + time;

        let orderObj = {
          ORDId :"ORD"+ Math.floor(Math.random() * 100000 * 10),
          dateAndTime: dateTime,
          userId: objectId(userId),
          paymentMetohd: payMethod,
          totalAmount: price,
          products: products,
          deliveryAddress: DeliAddress,
          groupOrder:true,
          date: today
        };

        let address = await db
          .get()
          .collection(user_collection.USER_COLLECTION)
          .findOne({
            _id: objectId(userId),
            deliveryAddress: { $exists: true },
          });

        if (address) {
          db.get()
            .collection(user_collection.DELIVERY_COLLECTION)
            .insertOne({ productDetails: orderObj })
            .then((result) => {
              id = result.insertedId;
              resolve(id);
            });

          db.get()
            .collection(user_collection.USER_COLLECTION)
            .updateOne(
              { _id: objectId(userId) },
              { $unset: { cartItems: "" } }
            );
        } else {
          console.log("else");
          resolve((added = true));
        }
      }
    });
  },

  getAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      let exist = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId), deliveryAddress: { $exists: true } });

      if (exist) {
        let address = db
          .get()
          .collection(user_collection.USER_COLLECTION)
          .findOne({ _id: objectId(userId) });

        resolve(address);
      } else {
        resolve((address = false));
      }
    });
  },

  generateRazorPay: (orderId, price) => {
    return new Promise((resolve, reject) => {
      instance.orders.create(
        {
          amount: price * 100,
          currency: "INR",
          receipt: orderId,
          notes: {
            key1: "value3",
            key2: "value2",
          },
        },
        (err, order) => {
          if (err) {
            console.log("err");
            console.log(err);
          } else {
            resolve(order);
          }
        }
      );
    });
  },

  verifyPayment: (details) => {
    return new Promise(async (resolve, reject) => {
      const { createHmac } = await import("node:crypto");

      let hmac = createHmac("sha256", "ttVKEPy4Xg8BM85QZWsD9ovr");
      hmac.update(
        details["response[razorpay_order_id]"] +
          "|" +
          details["response[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");

      if (hmac == details["response[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  changePaymentStatus: (orderId, payDetails) => {
    console.log("ithan : " + orderId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(user_collection.DELIVERY_COLLECTION)
        .updateOne(
          { _id: objectId(orderId),"productDetails.products.status":"PENDING"},
          {
            $set: {
              "productDetails.products.$.status": "PLACED",
              paymentDetails: payDetails,
            },
          }
        );
      resolve();
    });
  },

  getOrders: (userIds) => {
    return new Promise(async (resolve, reject) => {
      let ordersDetails = await db
        .get()
        .collection(user_collection.DELIVERY_COLLECTION)
        .aggregate([
          {
            $match: { "productDetails.userId": objectId(userIds) },
          },

          {
            $unwind: "$productDetails.products",
          },

          {
            $project: {
              proId: "$productDetails.products.proId",
              quantity: "$productDetails.products.quantity",
              delId: "$_id",
              date: "$productDetails.dateAndTime",
              status: "$productDetails.products.status",
              
            },
          },
          {
            $lookup: {
              from: user_collection.PRODUCT_COLLECTION,
              localField: "proId",
              foreignField: "_id",
              as: "orders",
            },
          },
        ])
        .sort({ _id: -1 })
        .toArray();

      console.log("ordersDetails");
      console.log(ordersDetails);

      resolve(ordersDetails);
    });
  },

  deleteOrder: (ordId, proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(user_collection.DELIVERY_COLLECTION)
        .updateOne(
          { _id: objectId(ordId),"productDetails.products.proId":objectId(proId) },
          {
            $set: {
              "productDetails.products.$.status": "CANCELLED",
            },
          }
        );
      resolve((deleted = true));
    });
  },

  getDelAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      let delAddress = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) });

      resolve(delAddress);
    });
  },

  getProDetails: (proId) => {
    return new Promise(async (resolve, reject) => {
      let proDetails = await db
        .get()
        .collection(user_collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(proId) });

      resolve(proDetails);
    });
  },

  getOrderDetils: (ordId) => {
    return new Promise(async (resolve, reject) => {
      let orderDetails = await db
        .get()
        .collection(user_collection.DELIVERY_COLLECTION)
        .findOne({ _id: objectId(ordId) });
      resolve(orderDetails);
    });
  },

  getPayPrice: (id) => {
    return new Promise(async (resolve, reject) => {
      let payPrice = await db
        .get()
        .collection(user_collection.DELIVERY_COLLECTION)
        .findOne({ _id: objectId(id) });

      resolve(payPrice.productDetails.totalAmount);
    });
  },

  getSingleProduct: (proId, userId, payMethod) => {
    return new Promise(async (resolve, reject) => {
      let status = payMethod == "COD" ? "PLACED" : "PENDING";
      let cart = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId), cartItems: { $exists: true } });

      if (cart) {
        let cartLength = cart.cartItems.length;
        console.log(cartLength, "hkhsdjuk");

        if (cartLength != 0) {
          let product = await db
            .get()
            .collection(user_collection.USER_COLLECTION)
            .aggregate([
              {
                $match: { _id: objectId(userId) },
              },
              {
                $unwind: "$cartItems",
              },

              {
                $match: {
                  "cartItems.product": objectId(proId),
                },
              },
              {
                $project: {
                  proId: "$cartItems.product",
                  quantity: "$cartItems.count",
                  status: status,
                  _id: 0,
                },
              },
              {
                $lookup: {
                  from: user_collection.PRODUCT_COLLECTION,
                  localField: "proId",
                  foreignField: "_id",
                  as: "orders",
                },
              },
            ])
            .toArray();
          console.log("product");
          console.log(product);
          resolve(product);
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  },

  productPrice: (proId) => {
    return new Promise(async (resolve, reject) => {
      let price = await db
        .get()
        .collection(user_collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(proId) });

      console.log("price");
      console.log(price.price);
    });
  },

  placeSingleProduct: (
    userId,
    total,
    products,
    payMethod,
    DeliAddress,
    coupId,
    count,
    price,
    proId
  ) => {
    return new Promise(async (resolve, reject) => {
      if (coupId) {
        let disPrize = await db
          .get()
          .collection(user_collection.COUPEN_COLLECTIO)
          .findOne({ coupenCode: coupId });

        if (disPrize && disPrize.minPurchase <= price) {
          console.log("id sheriyan");
          let disAmount = disPrize.disAmount;
          let newPrize = total - disAmount;

          console.log("newPrize", newPrize);

          let status = payMethod == "COD" ? "Placed" : "PENDING";
          let today = new Date();
          let date =
            today.getFullYear() +
            "-" +
            (today.getMonth() + 1) +
            "-" +
            today.getDate();
          let time =
            today.getHours() +
            ":" +
            today.getMinutes() +
            ":" +
            today.getSeconds();
          let dateTime = date + ", " + time;

          let orderObj = {
            dateAndTime: dateTime,
            userId: objectId(userId),
            paymentMetohd: payMethod,
            totalAmount: newPrize,
            products: products,
            status: status,
            deliveryAddress: DeliAddress,
            coupen: coupId,
            singleOrder: true,
            date: today
          };

          let address = await db
            .get()
            .collection(user_collection.USER_COLLECTION)
            .findOne({
              _id: objectId(userId),
              deliveryAddress: { $exists: true },
            });

          if (address) {
            db.get()
              .collection(user_collection.DELIVERY_COLLECTION)
              .insertOne({ productDetails: orderObj })
              .then((result) => {
                id = result.insertedId;
                resolve(id);
              });

            db.get()
              .collection(user_collection.USER_COLLECTION)
              .updateOne(
                { _id: objectId(userId) },
                { $pull: { cartItems: { product: objectId(proId) } } }
              );
          } else {
            console.log("else");
            resolve((added = true));
          }
        } else {
          console.log("id sheriyall");

          resolve({ wrongCoupId: true });
        }
      } else {
        console.log("coup illa");
        let status = payMethod == "COD" ? "Placed" : "PENDING";
        let today = new Date();
        let date =
          today.getFullYear() +
          "-" +
          (today.getMonth() + 1) +
          "-" +
          today.getDate();
        let time =
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds();
        let dateTime = date + ", " + time;

        let orderObj = {
          dateAndTime: dateTime,
          userId: objectId(userId),
          paymentMetohd: payMethod,
          totalAmount: price,
          products: products,
          status: status,
          deliveryAddress: DeliAddress,
          date: today
        };

        let address = await db
          .get()
          .collection(user_collection.USER_COLLECTION)
          .findOne({
            _id: objectId(userId),
            deliveryAddress: { $exists: true },
          });

        if (address) {
          db.get()
            .collection(user_collection.DELIVERY_COLLECTION)
            .insertOne({ productDetails: orderObj })
            .then((result) => {
              id = result.insertedId;
              resolve(id);
            });

          db.get()
            .collection(user_collection.USER_COLLECTION)
            .updateOne(
              { _id: objectId(userId) },
              { $pull: { cartItems: { product: objectId(proId) } } }
            );
        } else {
          console.log("else");
          resolve((added = true));
        }
      }
    });
  },

  addUserAddress: (userId, permenentAddress) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(user_collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          {
            $set: {
              permanentAddress: permenentAddress,
            },
          }
        );
      resolve((success = true));
    });
  },

  getUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      let userDetails = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) });

      resolve(userDetails);
    });
  },

  addProfileImage: (userId, image) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(user_collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          {
            $set: {
              image,
            },
          }
        );
      resolve((success = true));
    });
  },

  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = db
        .get()
        .collection(user_collection.CATEGORY_COLLECTION)
        .find()
        .limit(4)
        .toArray();
      resolve(category);
    });
  },

  getUserCategory: (categorys) => {
    return new Promise(async (resolve, reject) => {
      let category = db
        .get()
        .collection(user_collection.PRODUCT_COLLECTION)
        .find({ category: categorys })
        .toArray();
      resolve(category);
    });
  },

  getSingleProductforPlace: (proId, userId, payMethod) => {
    return new Promise(async (resolve, reject) => {
      let status = payMethod == "COD" ? "PLACED" : "PENDING";
      let cart = await db
        .get()
        .collection(user_collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId), cartItems: { $exists: true } });

      if (cart) {
        let cartLength = cart.cartItems.length;
        console.log(cartLength, "hkhsdjuk");

        if (cartLength != 0) {
          let product = await db
            .get()
            .collection(user_collection.USER_COLLECTION)
            .aggregate([
              {
                $match: { _id: objectId(userId) },
              },
              {
                $unwind: "$cartItems",
              },

              {
                $match: {
                  "cartItems.product": objectId(proId),
                },
              },
              {
                $project: {
                  proId: "$cartItems.product",
                  quantity: "$cartItems.count",
                  status: status,
                  _id: 0,
                },
              },
            ])
            .toArray();
          console.log("product of place");
          console.log(product);
          resolve(product);
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  },
  getProductPrice: (proId) => {
    return new Promise(async (resolve, reject) => {
      let price = db
        .get()
        .collection(user_collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(proId) });

      resolve(price);
    });
  },

  getDeliveryAddress: (ordId) => {
    return new Promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(user_collection.DELIVERY_COLLECTION)
        .findOne({ _id: objectId(ordId) });
      resolve(address);
    });
  },

  getOrderDetilsview: (ordId) => {
    console.log(ordId,"jkjhsf");
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(user_collection.DELIVERY_COLLECTION)
        .aggregate([
          {
            $match:{_id:objectId(ordId)}
          },
          {
            $unwind:"$productDetails.products" 
          },
          {
            $project:{
              proId:"$productDetails.products.proId" ,
              quantity:"$productDetails.products.quantity" ,
              status:"$productDetails.products.status" ,
              dateAndTime:"$productDetails.dateAndTime" ,
              ordId:ordId
              
              
            }  
          }, 
          { 
            $lookup:{
              from:user_collection.PRODUCT_COLLECTION,
              localField: "proId",
              foreignField: "_id",
              as: "orders",   
 
            }        
          } 
        ]).toArray(); 
 
        
        resolve(products)  
    });
  },

  //pagination
  productViewPagination:(perPage, skipNo)=>{
    return new Promise((resolve, reject) => {
      let product = db
        .get()
        .collection(user_collection.PRODUCT_COLLECTION)
        .find().limit (perPage) .skip (skipNo)
        .toArray()

       

        resolve(product)
        
    });
  },

  countDocuments:()=>{
    return new Promise((resolve, reject) => {
      let countDocuments = db
        .get()
        .collection(user_collection.PRODUCT_COLLECTION)
        .countDocuments()

       

        resolve(countDocuments)
        
    });
  },

  //Search
  getSearchResult:(key)=>{
    return new Promise(async (resolve, reject) => {
      let searchResult = await db
        .get()
        .collection(user_collection.PRODUCT_COLLECTION)
        .find({
          productName: {
            $regex: key,
            $options: "ix",
          },
        })
        .toArray();
      resolve(searchResult);
    });

  }




}; 
