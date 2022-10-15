var db = require("../config/conection");
var product_collection = require("../config/collections");
const { search } = require("../app");

var objectId = require("mongodb").ObjectId;

module.exports = {
  addProduct: (product) => {
    product.price = parseInt(product.price);
    return new Promise((resolve, reject) => {
      db
        .get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .insertOne(product).then;
      resolve(product._id);
    });
  },

  getAllproduct: () => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(product);
    });
  },

  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .deleteOne({
          _id: objectId(proId),
        })
        .then((response) => {
          resolve(response);
        });
    });
  },
  editProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .findOne({
          _id: objectId(proId),
        })
        .then((product) => {
          resolve(product);
        });
    });
  },

  updateProduct: (proId, proDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .updateOne(
          {
            _id: objectId(proId),
          },
          {
            $set: {
              productName: proDetails.productName,
              category: proDetails.category,
              company: proDetails.company,
              price: parseInt(proDetails.price),
              discription: proDetails.discription,
              quantity: proDetails.quantity,
            },
          }
        )
        .then((response) => {
          resolve({
            upadte: true,
          });
        });
    });
  },

  getMob: () => {
    return new Promise((resolve, reject) => {
      let mobile = db
        .get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .find({
          catogory: "Mobile",
        })
        .toArray();
      resolve(mobile);
    });
  },

  getHset: () => {
    return new Promise((resolve, reject) => {
      let Headset = db
        .get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .find({
          catogory: "Headset",
        })
        .toArray();
      resolve(Headset);
    });
  },

  getpBank: () => {
    return new Promise((resolve, reject) => {
      let powerbank = db
        .get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .find({
          catogory: "Powerbank",
        })
        .toArray();
      resolve(powerbank);
    });
  },

  getCharger: () => {
    return new Promise((resolve, reject) => {
      let powerbank = db
        .get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .find({
          catogory: "Charger",
        })
        .toArray();
      resolve(powerbank);
    });
  },

  doLoginAdmin: (adminData) => {
    return new Promise((resolve, reject) => {
      let response = {};

      // let admin = await db
      //   .get()
      //   .collection(product_collection.ADMIN_AUTH)
      //   .findOne({ email: userData.email });
      // console.log(" admin finding ");
      let admin = {
        email:process.env.EMAIL ,
        password:process.env.PASSWORD,
      };

      if (admin.email == adminData.email) {
        if (admin.password == adminData.password) {
          response.admin = admin;
          response.status = true;
          resolve(response);
          console.log("response");
        } else {
          console.log("pass err");
          resolve({
            status: false,
          });
        }
      } else {
        console.log("no admin");
        resolve({
          status: false,
        });
      }
    });
  },

  doSearch: (key) => {
    return new Promise(async (resolve, reject) => {
      let search = await db
        .get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .find({
          $or: [
            {
              productName: {
                $regex: key,
              },
            },
          ],
        })
        .toArray();
      resolve(search);
    });
  },

  getOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(product_collection.DELIVERY_COLLECTION)
        .find({})
        .sort({
          _id: -1,
        })
        .toArray();
      resolve(orders);
    });
  },

  getOrderDetails: (ordId) => {
    return new Promise(async (resolve, reject) => {
      console.log(ordId);
      let ordersDetails = await db
        .get()
        .collection(product_collection.DELIVERY_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: objectId(ordId),
            },
          },

          {
            $unwind: "$productDetails.products",
          },

          {
            $project: {
              ORDID:"$productDetails.ORDId",
              proId: "$productDetails.products.proId",
              quantity: "$productDetails.products.count",
              delId: "$_id",
              date: "$productDetails.dateAndTime",
              status: "$productDetails.products.status",

              paymentDetails: "$productDetails.paymentDetails",
              paymentMethod: "$productDetails.paymentMetohd",
              amount: "$productDetails.totalAmount",
            },
          },
          {
            $lookup: {
              from: product_collection.PRODUCT_COLLECTION,
              localField: "proId",
              foreignField: "_id",
              as: "order",
            },
          },
        ])
        .sort({
          _id: -1,
        })
        .toArray();

      resolve(ordersDetails);
    });
  },

  statusShipped: (ordId, proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(product_collection.DELIVERY_COLLECTION)
        .updateOne(
          {
            _id: objectId(ordId),
            "productDetails.products.proId": objectId(proId),
          },
          {
            $set: {
              "productDetails.products.$.status": "SHIPPED",
            },
          }
        );
      resolve((shipped = true));
    });
  },

  stausePlaced: (ordId, proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(product_collection.DELIVERY_COLLECTION)
        .updateOne(
          {
            _id: objectId(ordId),
            "productDetails.products.proId": objectId(proId),
          },
          {
            $set: {
              "productDetails.products.$.status": "PLACED",
            },
          }
        );
      resolve((shipped = true));
    });
  },

  stauseDeliverd: (ordId, proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(product_collection.DELIVERY_COLLECTION)
        .updateOne(
          {
            _id: objectId(ordId),
            "productDetails.products.proId": objectId(proId),
          },
          {
            $set: {
              "productDetails.products.$.status": "DELIVERED",
            },
          }
        );
      resolve((shipped = true));
    });
  },

  addCoupen: (coupen) => {
    coupen.disAmount = parseInt(coupen.disAmount);
    console.log();
    let coupenDetails = {
      coupenCode: coupen.coupenCode,
      disAmount: coupen.disAmount,
      aboutOffer: coupen.aboutOffer,
      minPurchase: coupen.disAmount + coupen.disAmount,
    };
    console.log(coupenDetails);
    coupen.disAmount = parseInt(coupen.disAmount);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(product_collection.COUPEN_COLLECTIO)
        .insertOne(coupenDetails);
      resolve((added = true));
    });
  },

  getCoupens: () => {
    return new Promise(async (resolve, reject) => {
      let coupensDetails = await db
        .get()
        .collection(product_collection.COUPEN_COLLECTIO)
        .find()
        .toArray();
      resolve(coupensDetails);
    });
  },

  deleteCoupen: (coupId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(product_collection.COUPEN_COLLECTIO)
        .deleteOne({
          _id: objectId(coupId),
        });
      resolve((deleted = true));
    });
  },

  getDeliverAddress: (ordId) => {
    return new Promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(product_collection.DELIVERY_COLLECTION)
        .findOne({
          _id: objectId(ordId),
        });
      resolve(address);
    });
  },

  getUserDetails: () => {
    return new Promise(async (resolve, reject) => {
      let userDetails = await db
        .get()
        .collection(product_collection.USER_COLLECTION)
        .find({})
        .toArray();
      resolve(userDetails);
    });
  },

  changeUserStatus: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(product_collection.USER_COLLECTION)
        .findOne({
          _id: objectId(userId),
        });

      if (!user.user) {
        db.get()
          .collection(product_collection.USER_COLLECTION)
          .updateOne(
            {
              _id: objectId(userId),
            },
            {
              $set: {
                user: true,
              },
            }
          );
        resolve((block = false));
      } else {
        db.get()
          .collection(product_collection.USER_COLLECTION)
          .updateOne(
            {
              _id: objectId(userId),
            },
            {
              $set: {
                user: false,
              },
            }
          );
        resolve((block = true));
      }
    });
  },

  addCategory: (category) => {
    return new Promise(async (resolve, reject) => {
      category.category = category.category.toUpperCase();

      let categoryExist = await db
        .get()
        .collection(product_collection.CATEGORY_COLLECTION)
        .findOne({
          category: category.category,
        });

      console.log(categoryExist);

      if (categoryExist) {
        resolve({
          exist: true,
        });
        console.log("this allredy Exist");
      } else {
        db.get()
          .collection(product_collection.CATEGORY_COLLECTION)
          .insertOne(category);
        resolve({
          exist: false,
        });
      }
    });
  },

  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      let categoryList = await db
        .get()
        .collection(product_collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(categoryList);
    });
  },

  getCategoryItems: (categoryName) => {
    return new Promise(async (resolve, reject) => {
      let categoryItems = await db
        .get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .find({
          category: categoryName,
        })
        .toArray();

      resolve(categoryItems);
    });
  },

  getProductSearch: (key) => {
    return new Promise(async (resolve, reject) => {
      let searchResult = await db
        .get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .find({
          productName: {
            $regex: key,
            $options: "ix",
          },
        })
        .toArray();
      resolve(searchResult);
    });
  },
  getTotalProduct: () => {
    return new Promise(async (resolve, reject) => {
      let totalProduct = await db
        .get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .find()
        .count();
      console.log(totalProduct, "total");
      resolve(totalProduct);
    });
  },

  getTotalUsers: () => {
    return new Promise(async (resolve, reject) => {
      let totalUser = await db
        .get()
        .collection(product_collection.USER_COLLECTION)
        .find()
        .count();
      console.log(totalUser, "user");
      resolve(totalUser);
    });
  },

  getTotalOrder: () => {
    return new Promise(async (resolve, reject) => {
      let totalOrder = await db
        .get()
        .collection(product_collection.DELIVERY_COLLECTION)
        .find()
        .count();
      console.log(totalOrder, "Order");
      resolve(totalOrder);
    });
  },

  getTotalCategory: () => {
    return new Promise(async (resolve, reject) => {
      let totalCategory = await db
        .get()
        .collection(product_collection.CATEGORY_COLLECTION)
        .find()
        .count();
      console.log(totalCategory, "Category");
      resolve(totalCategory);
    });
  },

  getStatusCount: () => {
    return new Promise(async (resolve, reject) => {
      let placedItems = await db
        .get()
        .collection(product_collection.DELIVERY_COLLECTION)
        .aggregate([
          {
            $unwind: "$productDetails.products",
          },
          // {
          //   $match:{'productDetails.products.status':'PLACED'

          //   }
          // },
          {
            $group: {
              _id: "$productDetails.products.status",
              count: {
                $sum: 1,
              },
            },
          },
        ])
        .toArray();
      resolve(placedItems);
      console.log(placedItems);
    });
  },

  getCategorySales: () => {
    return new Promise(async (resolve, reject) => {
      let CategorySales = await db
        .get()
        .collection(product_collection.DELIVERY_COLLECTION)
        .aggregate([
          {
            $unwind:'$productDetails.products'
          },

          {
            $project:{
              proId: '$productDetails.products.proId',
              quantity: '$productDetails.products.quantity',
              date: '$productDetails.dateAndTime'
            }

          },


          {
            $lookup:{

            from: product_collection.PRODUCT_COLLECTION,
            localField: "proId",
            foreignField: "_id",
            as: "order",

          }
            
          },
          {
            $unwind:'$order'
          },
          {
            $project:{
              quantity:'$quantity',
              category: '$order.category',
              price:'$order.price'
            }
          },
          {
            $group:{
              _id:'$category', 
              totalAmount: { $sum: { $multiply: [ "$price", "$quantity" ] } }

            }
          },
         



        ])
        .toArray();
      resolve(CategorySales);
      console.log("CategorySales");
      console.log(CategorySales);
    });
  },

  //totalRevenueChart
   totalRevenueChart:()=>{
    return new Promise(async (resolve,reject)=>{
      let today = new Date(); 
      let before = new Date(new Date().getTime()-(250*24*60*60*1000))

      console.log(before);
      

      let revenue= await db.get().collection(product_collection.DELIVERY_COLLECTION).aggregate([
        {
          $match:{
            'productDetails.products':{
              $elemMatch:{
                status:'DELIVERED'
              }
            }, 'productDetails.date':{
              $gte:before,
              $lte:today
            }
          }
        },
        {
          $project:{
            method:'$productDetails.paymentMetohd',
            amount:'$productDetails.totalAmount',
            date:'$productDetails.date'
          }
        },
       {
        $group:{
          _id:{ date:{$dateToString:{format: "%m-%Y", date:"$date"}}, method:'$method' },
          amount: { $sum: '$amount'}
        }
       },
       {
        $project:{
          date: '$_id.date',
          method:'$_id.method',
          amount: '$amount',
          _id:0
        }
       }




      ]).sort({date:1}). toArray()

      let obj = {
        date:[],cod:[0,0,0,0,0,0,0,0],online:[0,0,0,0,0,0,0,0]
      }

      let month=  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

      let a = today.getMonth() -6

      for (let i=0; i<8; i++){
        for(let k=0; k< revenue.length; k++){
          if(Number(revenue[k].date.slice(0,2)) == Number(a+i)){

            if(revenue[k].method == 'onlinePayment'){
              obj.online[i] = revenue[k].amount
            }else{
              obj.cod[i] = revenue[k].amount
            }

          }
        }

        obj.date[i] = month [a+i-1]

      }
      
      console.log('revenue1');
      console.log(revenue);
      resolve(obj)

    })
  },

  //sles Report

  downLoadSalesReport:()=>{
    return new Promise(async (resolve, reject) => {
      let thisMonth = new Date().getMonth()
      let salesReport = await db
        .get()
        .collection(product_collection.DELIVERY_COLLECTION)
        .aggregate([
         
          {
            $unwind: "$productDetails.products",
          },

          {
            $project: {
              ORDId: "$productDetails.ORDId",
              proId: "$productDetails.products.proId",
              quantity: "$productDetails.products.quantity",
              delId: "$_id",
              date: "$productDetails.dateAndTime",
              status: "$productDetails.products.status",
              paymentDetails: "$productDetails.paymentDetails",
              paymentMethod: "$productDetails.paymentMetohd",
              amount: "$productDetails.totalAmount",
            },
          },
          {
            $lookup: {
              from: product_collection.PRODUCT_COLLECTION,
              localField: "proId",
              foreignField: "_id",
              as: "order",
            },
          },

          {
            $unwind:'$order'
          },
          {
            $project:{
              ORD_Id: '$ORDId',
              Date: '$date',
              Product:'$order.productName',
              UnitPrice: '$order.price',
              Quantity:'$quantity',
              paymentMethod: '$paymentMethod',
              Total: '$amount',
              _id:0

            }
          }
        ])
        .sort({
          _id: -1,
        })
        .toArray();

        



      resolve(salesReport);
    });
  },

  //addProductAditionalDetails

  addProductAditionalDetails:(proId, details)=>{
    return new Promise((resolve, reject) => {

      db.get()
        .collection(product_collection.PRODUCT_COLLECTION)
        .updateOne(
          {
            _id: objectId(proId),
          },
          {
            $set: {
              rating: details.rating,
              Remark: details.Remark,
              bankOffer: details.bankOffer,
              discount: parseInt(details.discount)
            }
          }
        )
        .then((response) => {
          resolve({
            upadte: true,
          });
        });
    });

  }


};
