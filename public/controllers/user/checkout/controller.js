framebridge.controller("checkoutController", function(
  $location,
  $window,
  $scope,
  $state,
  $stateParams,
  $filter,
  $http,
  toastr,
  checkoutServices,
  authentication
) {
  $scope.obj = {};
  $scope.dateETA;
  $scope.length;
  $scope.buttonShow = true;
  $scope.discount = 0;
  $scope.OrderSuccess = false;
  /*--------------------------------*/
  $scope.sections = {};
  $scope.sections.checkoutLogin = false;
  $scope.sections.accountDetails = false;
  $scope.sections.payment = false;
  $scope.sections.confirm = false;
  /*--------------------------------*/
  $scope.sameAs = false;
  $scope.Billing = {};
  $scope.Shipping = {};
  $scope.cred = {};
  $scope.isUse = false;
  var vm = this;
  /*--------------------------------*/
  $scope.cardDetails = {};
  $scope.cardDetails.name = "";
  $scope.cardDetails.number = "";
  $scope.cardDetails.exp_month = "";
  $scope.cardDetails.exp_year = "";
  $scope.cardDetails.cvc = "";
  /*--------------------------------*/
  vm.credentials = {
    email: "",
    password: "",
    userType: "user"
  };

  var myItems = [];
  /*---------------------------------*/
  $scope.frameSizesArray = {
    XS: "Insta",
    S: "Small",
    M: "Medium",
    L: "Large",
    XL: "Extra Large",
    XXL : 'Extra Extra Large'
  };
  /*---------------------------------*/

  //  Get All the cart value from the multiple collections

  $scope.getCartData = function() {
    $scope.obj.loading = true;
    checkoutServices.cartValues().then(function successCB(response) {
        $scope.sections = response.data.sections;
        $scope.cartData = response.data.cartData;
        if(!response.data.cartData) {
          $state.go('user.addToCart');
        }
        $scope.products = $scope.cartData.products;
        $scope.length = $scope.products.length;
        var length = $scope.products.length - 1;
        $scope.artSizeCost = $scope.products[length].imageSizeCost;
        $scope.totalPrice = response.data.cartData.totalPrice;
        // here we need to add and Edit total price based on Promo
        if(response.data.promoData) {
          $scope.discount = response.data.promoData.discount;
        }
        $scope.products = response.data.cartData.products;

        for(var j=0 ;j < $scope.products.length ; j++) {
          var obj = {};
          obj.name =  $scope.products[j].frameData.frameName;
          obj.description =  $scope.products[j].frameData.frameDescription;
          obj.quantity =  $scope.products[j].quantity;
          obj.price =  $scope.products[j].itemPrice;
          obj.currency =  'AUD';
          myItems.push(obj);
        }

        var disc = {
          "name": "Promo Discount",                    
          "price": - $scope.discount,
          "currency": "AUD",
          "quantity": 1
        }
        
        myItems.push(disc);
        $scope.sections = response.data.sections;
        $scope.obj.loading = false;
        $scope.$emit("cartVal", $scope.length);
      },
      function errorCB(response) {
        $scope.obj.loading = false;
        $scope.cartData = {};
        $scope.products = {};
        // $scope.length = 0;
      }
    );
  };



  
  $scope.updateCartForUser = function() {
    $scope.obj.loading = true;
    checkoutServices.updateCartUserId().then(
      function successCB(succResponse) {
        $scope.updateUserCartPrice();
        $scope.obj.loading = false;
      },
      function errorCB(errResponse) {
        $scope.obj.loading = false;
      }
    );
  };

  $scope.updateCartForUser = function() {
    $scope.obj.loading = true;
    checkoutServices.updateCartUserId().then(
      function successCB(succResponse) {
        if(succResponse.data.promoSucc != undefined) {
          if(succResponse.data.promoSucc == true) {
          } else {
            toastr.error("User already redeem same promo code");
          }
        }
        $scope.updateUserCartPrice();
        $scope.obj.loading = false;
      },
      function errorCB(errResponse) {
        $scope.obj.loading = false;
      }
    );
  };


  $scope.updateCartForGuest = function() {
    $scope.obj.loading = true;
    checkoutServices.updateCartUserId().then(
      function successCB(succResponse) {
        $scope.updateGuestCartPrice();
        $scope.obj.loading = false;
      },
      function errorCB(errResponse) {
        $scope.obj.loading = false;
      }
    );
  };





  $scope.updateUserCartPrice = function() {
    checkoutServices.updateCartPrice().then(function succResp(response) {
      $state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
      $scope.obj.loading = false;
    }, function errResp(response) {
      console.log("Error Response is : ", response);
      $scope.obj.loading = false;
    });
  }

  

  $scope.updateGuestCartPrice = function() {
    checkoutServices.updateCartPrice().then(function succResp(response) {
      $scope.obj.loading = false;
    }, function errResp(response) {
      console.log("Error Response is : ", response);
      $scope.obj.loading = false;
    });
  }




  $scope.paypalSelect = function() {
      $scope.buttonShow = false;
  }


  $scope.stripeSelect = function() {
      $scope.buttonShow = true;
  }


  


  /*$scope.updateCartPrice = function() {
    console.log("Updating Cart Price");
    checkoutServices.updateCartPrice().then(function succResp(response) {
      $state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
      $scope.obj.loading = false;
    }, function errResp(response) {
      console.log("Error Response is : ", response);
      $scope.obj.loading = false;
    });
  }*/




   $scope.showaddress = function() {
    $scope.obj.loading = true;
    checkoutServices.getUserAddress().then(
      function successCb(response) {
        $scope.userData = response.data.userData;
        $scope.Billing = $scope.userData.billingAddress;
        $scope.obj.loading = false;
      },
      function errorCb(response) {
        $scope.obj.loading = false;
      }
    );
  };

  //Login Controller Function

  $scope.Signin = function(vm) {
    $scope.obj.loading = true;
    authentication
      .login(vm.credentials)
      .error(function(err) {
        $scope.obj.loading = false;
        toastr.error("Either username or password is not correct");
      })
      .then(function(response) {
        $scope.loggedIn = true;
        $scope.$emit("loginSession", $scope.loggedIn);
        $scope.sections = response.data.sections;
        $scope.updateCartForUser();
        // $scope.checkPromoValid
        $scope.showaddress();
        $scope.obj.loading = false;
      });
  };

  $scope.guestCheckout = function() {
    $scope.sections.checkoutLogin = false;
    $scope.sections.accountDetails = true;
    $scope.sections.payment = false;
    $scope.sections.confirm = false;
    $scope.isUser = false;
  };

  $scope.updateAddress = function(Billing, Shipping) {
    var data = {};
    data.Billing = Billing;
    if ($scope.sameAs) {
      data.Shipping = Shipping;
    } else {
      data.Shipping = Billing;
    }
    $scope.obj.loading = true;
    checkoutServices.updateUserAddress(data).then(
      function successCB(response) {
        $scope.sections = response.data.sections;
        $scope.obj.loading = false;
      },
      function errorCB(response) {
        $scope.accountDetails = false;
        $scope.checkoutLogin = true;
        $scope.obj.loading = false;
      }
    );
  };

  $scope.showCreateUser = function() {
    $scope.sections.checkoutLogin = false;
    $scope.sections.accountDetails = true;
    $scope.isUser = true;
    $scope.sections.payment = false;
    $scope.sections.confirm = false;
  };

  //Create new user Function

  $scope.isSameAddress = function(value) {
    $scope.sameAs = value;
  };


  $scope.changeUser = function(userVal) {
    $scope.isUser = userVal;
  }

  $scope.createGuestAccount = function(Billing, Shipping) {
    $scope.obj.loading = true;
    var data = {};
    data.email = Billing.email;
    data.firstName =  Billing.firstName;
    data.lastName =  Billing.lastName;
    data.Billing = Billing;
    if ($scope.sameAs) {
      data.Shipping = Shipping;
    } else {
      data.Shipping = Billing;
    }

    authentication.guestRegister(data).then(
      function success(response) {
        $scope.updateCartForGuest();
        $scope.sections = response.data.sections;
        $scope.obj.loading = false;
      },
      function errorResp(response) {
        $scope.sections.accountDetails = false;
        $scope.sections.checkoutLogin = true;
        $scope.obj.loading = false;
      }
    );
  };

  $scope.createUserAccount = function(Billing, Shipping) {
    $scope.obj.loading = true;
    var data = {};
    data.email = Billing.email;
    data.firstName =  Billing.firstName;
    data.lastName =  Billing.lastName;
    data.password = Billing.password;
    data.confirmPassword = Billing.confirmPassword;
    data.Billing = Billing;
    if ($scope.sameAs) {
      data.Shipping = Shipping;
    } else {
      data.Shipping = Billing;
    }

    authentication.register(data).then(
      function success(response) {
        $scope.loggedIn = true;
        // $state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
        $scope.$emit("loginSession", $scope.loggedIn);
        $scope.sections = response.data.sections;
        $scope.updateCartForGuest();
        $scope.obj.loading = false;
      },
      function errorResp(response) {
        toastr.error("Unsuccess", response.data.message);
        $scope.sections.accountDetails = false;
        $scope.sections.checkoutLogin = true;
        $scope.obj.loading = false;
      }
    );
  };

  $scope.getMonthYear = function() {
    $scope.months = [];
    $scope.years = [];
    var months = moment.months();

    for (var j = 0; j < months.length; j++) {
      var obj = {};
      if (j + 1 < 10) {
        obj.month = months[j];
        obj.monthId = "0" + (j + 1);
      } else {
        obj.month = months[j];
        obj.monthId = j + 1;
      }
      $scope.months.push(obj);
    }
    var year = new Date();
    year = year.getFullYear();
    for (var i = 0; i < 25; i++) {
      $scope.years.push(year + i);
    }
    $scope.cardDetails.exp_month = $scope.months[1];
    $scope.cardDetails.exp_year = $scope.years[10];
  };

  $scope.deleteProductValue = function(id) {
    var data = {};
    data.productId = id;
    cartServices.deleteProduct(data).then(
      function successResp(response) {
        $state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
      },
      function errResp(response) {
        console.log("The error response in deleteProductValue is : ", response);
      }
    );
  };

  $scope.deleteAndEdit = function(id) {
    var data = {};
    data.productId = id;
    cartServices.deleteProduct(data).then(
      function successResp(response) {
        $state.go("user.editImage");
      },
      function errResp(response) {
        console.log("The error response in deleteProductValue is : ", response);
      }
    );
  };

  // Payment via Stripe Account
  $scope.payNow = function(cardDetails) {
    $scope.obj.loading = true;
    $scope.length = 0;
    $scope.$emit("cartVal", $scope.length);
    checkoutServices.payment(cardDetails).then(
      function successResp(response) {
        if ((response.data.status = "succeeded")) {
          // console.log("Stripe Response is : ", JSON.stringify(response));
          $scope.checkOut(response);
          $scope.obj.loading = false;
        }
      },
      function errorResp(response) {
        $scope.obj.loading = false;
      }
    );
  };


  $scope.paypalPay = function() {
    $scope.obj.loading = true;
    $scope.length = 0;
    $scope.$emit("cartVal", $scope.length);
    checkoutServices.paypalPayment().then(
      function successResp(response) {
        if ((response.data.status = "succeeded")) {
          $scope.checkOut();
          $scope.obj.loading = false;
        }
      },
      function errorResp(response) {
        $scope.obj.loading = false;
      }
    );
  };



  $scope.checkOut = function(data) {
    $scope.obj.loading = true;
    checkoutServices.checkOut(data).then(function(response) {
      if (response.data.status == 200) {
        $scope.ordersData = response.data.ordersData;
        $scope.clearCookie();
        $scope.sections = response.data.sections;
        $scope.OrderSuccess = response.data.sections.confirm;
        var orderDate = new Date($scope.ordersData.createdOn);
        orderDate.setDate(orderDate.getDate() + $scope.dateETA); //number  of days to add, e.x. 15 days
        $scope.ordrDelvryDate = orderDate.toISOString().substr(0, 10);
        $scope.$emit("cartVal", 0);
        $scope.obj.loading = false;
      } else {
        console.log("No Response", response.data.message);
        $scope.obj.loading = false;
      }
    });
  };

  $scope.getETA = function() {
    checkoutServices.checkOutDate().then(
      function succResp(response) {
        var someDate = new Date();
        $scope.dateETA = response.data.etaData.estimatedDays;
        someDate.setDate(someDate.getDate() + $scope.dateETA); //number  of days to add, e.x. 15 days
        $scope.estimatedDate = someDate.toISOString().substr(0, 10);
      },
      function errorResp(response) {
        console.log("CheckoutDate error response : ", response);
      }
    );
  };

  $scope.clearCookie = function(name) {
    document.cookie =
      "qwertyuiop=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  // Render the button into the container element

  paypal.Button.render(
    {
      env: "sandbox", // sandbox | production
      
      locale: 'en_AU',
      
      style: {
          size: 'medium',
          color: 'gold',
          shape: 'rect',
          label: 'pay'
      },

      client: {
        sandbox:
          "Af7Tu82rWoGbpLAkrZDPBQoLGlNwJWasQXICyu8oKAVdi8PnVc8kKUIY1wxO3z8VDAtmuUBY8iP6HBL1",
        production: "<insert production client id>"
      },

      // Show the buyer a 'Pay Now' button in the checkout flow
      commit: true,

      // payment() is called when the button is clicke
      
      payment: function(data, actions) {
        // Make a call to the REST api to create the payment
        return actions.payment.create({
          payment: {
            intent: "sale",
            redirect_urls: {
              //return_url:'http://localhost:4099/process',
              //cancel_url:'http://localhost:4099/cancel'
            },
            payer: {
              payment_method: "paypal"
            },
            transactions: [
              {
                amount: {
                  total: $scope.totalPrice,
                  currency: "AUD"
                },
                item_list: {
                  items: myItems
                }
              }
            ]
          }
        });
      },

      // Pass a function to be called when the customer completes the payment

      onAuthorize: function(data, actions) {
        return actions.payment.execute().then(function(response) {
          if (response) {
            $scope.checkOut(response);
          }
        });
      },

      onCancel: function(data) {
        console.log("The payment cancelled!");
      }
    },
    "#myContainerElement"
  );
});

angular.module("framebridge").directive("previewCanvasCheck", [
  "$location",
  function($location) {
    return {
      scope: {
        productimage: "@",
        frameimage: "@",
        frameid: "@",
        artsize: "@",
        matcolor: "@",
        productw: "@",
        producth: "@"
      },

      //template: "<canvas id='"+frameid+"' />",
      restrict: "E",
      link: function(scope, element, attrs) {
        scope.$watchGroup(
          [
            "productimage",
            "frameimage",
            "frameid",
            "artsize",
            "matcolor",
            "productw",
            "producth"
          ],
          function(productimage) {
            imageUrl = productimage["0"];
            frameUrl = productimage["1"];
            frameId = productimage["2"];
            artSize = productimage["3"];
            colorData = productimage["4"];
            productW = productimage["5"];
            productH = productimage["6"];
            if (colorData == "") {
              colorData = "#FFF";
              artSize = "XXL";
            }
            if (frameId != "" && frameId) {
              drawImage(imageUrl,frameUrl,frameId,artSize,colorData,productW,productH);
            }
          },
          true
        );

        function calculateAspectRatioFit(
          srcWidth,
          srcHeight,
          maxWidth,
          maxHeight
        ) {
          var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
          var rtnWidth = srcWidth * ratio;
          var rtnHeight = srcHeight * ratio;
          return { width: rtnWidth, height: rtnHeight, ratio };
        }

        
        function drawImage(imageUrl,frameUrl,frameId,artSize,colorData,productW,productH) {
          var canvas = document.getElementById(frameId);

          if (imageUrl) {
            var imageObj = new Image();
            var imageObj1 = new Image();
            url =$location.protocol() + "://" + $location.host() + ":" + $location.port(); 
            uploadedImage = url + imageUrl;
            imageObj1.onload = function() {
              canvas.width = 140;
              canvas.height = 144;

              var parentWidth = 140; //self._widgetSize[0];
              var parentHeight = 144; //self._widgetSize[1];

              var imgSize = calculateAspectRatioFit(
                productW,
                productH,
                parentWidth,
                parentHeight
              );

              var ctx = canvas.getContext("2d");

              canvas.width = imgSize.width;
              canvas.height = imgSize.height;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = colorData;

              ctx.fillRect(0, 0, canvas.width, canvas.height);
              //artSize = 'M';
              if (artSize == "XXL") {
                imgX = imgY = 5;
                imgXm = imgYm = 10;
              } else if (artSize == "XL") {
                imgX = 20;
                imgY = 20;
                imgXm = 40;
                imgYm = 40;
              } else if (artSize == "L") {
                imgX = 25;
                imgY = 25;
                imgXm = 50;
                imgYm = 50;
              } else if (artSize == "M") {
                imgX = 30;
                imgY = 30;
                imgXm = 60;
                imgYm = 60;
              } else if(artSize == "S"){
                imgX = 35;
                imgY = 35;
                imgXm = 70;
                imgYm = 70;
              } else {
                imgX = 40;
                imgY = 45;
                imgXm = 80;
                imgYm = 80;
              }
              

              if (Math.round(productH) > Math.round(productW)) {
                frameImage = url + "/images/frames/PORTRAIT/" + frameUrl;
              } else if (Math.round(productW) > Math.round(productH)) {
                frameImage = url + "/images/frames/LANDSCAPE/" + frameUrl;
              } else if (Math.round(productW) == Math.round(productH)) {
                frameImage = url + "/images/frames/SQUAR/" + frameUrl;
              } else {
                frameImage = url + "/images/frames/PANAROMIC/" + frameUrl;
              }

              imageObj.src = frameImage;
              imageObj.onload = function() {
                
                // scope.frameImage = "";


                //UPLOADED
                ctx.drawImage(imageObj1,imgX,imgY,imgSize.width - imgXm,imgSize.height - imgYm);
                //FRAME
                ctx.drawImage(imageObj, 0, 0, imgSize.width, imgSize.height);
              };
            };
            imageObj1.src = uploadedImage;
          }
        }
        // scope.frameimage = "";
      }
    };
  }
]);
