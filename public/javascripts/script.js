function addToCart(proId) {
  $.ajax({ 
    url: "/addToCart/" + proId,
    method: "get",
    success: (response) => {
      alert("added to your cart");
    },
  });
}

function changeAddress() {
  $("#addNewAddress").submit((e) => {
    e.preventDefault();

    $.ajax({
      url: "/changeAddress",
      type: "post",
      data: $("#addNewAddress").serialize(),
      success: (response) => {
        console.log(response);
        setInterval("location.reload()", 1000);
      },
    });
  });
}












function razorPayPayment(data) {
  var options = {
    key: "rzp_test_4TGCAcR2InXIlU", // Enter the Key ID generated from the Dashboard
    amount: data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Phone Cone",
    description: "Test Transaction",
    image: "https://example.com/your_logo",
    order_id: data.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      console.log("haikooi");
      verifyPayment(response, data);
    },
    prefill: {
      name: "Gaurav Kumar",
      email: "gaurav.kumar@example.com",
      contact: "9999999999",
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#3399cc",
    },
  };

  var rzp1 = new Razorpay(options);
  rzp1.on("payment.failed", function (response) {
    alert(response.error.code);
    alert(response.error.description);
    alert(response.error.source);
    alert(response.error.step);
    alert(response.error.reason);
    alert(response.error.metadata.order_id);
    alert(response.error.metadata.payment_id);
  });
  document.getElementById("rzp-button1").onclick = function (e) {
    rzp1.open();
    e.preventDefault();
  };

  
}

function verifyPayment(response, data) {
  $.ajax({
    url: "/verifyPayment",
    data: {
      response,
      data,
    },
    type: "post",
    success: (response) => {
      if (response.status) {
        location.href = "/paymentSuccess";
      } else {
        alert("fail");
      }
    },
  });
}



//Cancel Order
function deleteOrder(delId,proId) {
  $.ajax({
    url: "/deleteOrders",
    data: {
      ordId:delId,
      proId:proId
    },
    type: "post",
    success: (response) => {
      location.reload()
      
    },
  });
}


//Admin Status Change





