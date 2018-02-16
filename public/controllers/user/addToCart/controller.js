framebridge.controller('cartController', function($scope, $state, $stateParams, $filter, toastr, cartServices) {
  $scope.value = false;
 
  var gift = false;
  $scope.obj = {};
  $scope.dateETA;
  $scope.quantitys = [];
  $scope.frameSizesArray = {'XS' : 'Insta', 'S' : 'Small', 'M' : 'Medium', 'L' : 'Large', 'XL' : 'Extra Large', 'XXL' : 'Extra Extra Large'};
  $scope.length;
  $scope.item = {};
  $scope.promoCode;
  $scope.discount = 0;
  $scope.isGift;
  $scope.showMailinType = false;
  $scope.packagingType = [{
    "id": 1,
    "type": "TUBE"
  }, {
    "id": 2,
    "type": "FLAT MAILER"
  }, {
    "id": 3,
    "type": "I HAVE MY OWN (TUBE)"
  }, {
    "id": 4,
    "type": "I HAVE MY OWN (FLAT)"
  }];




  $scope.getCartData = function() {
    var cart = {};
    $scope.obj.loading = true;
    cartServices.cartValues().then(function successCB(response) {
      if (response.data.cartData) {
        var compareVal = 0;
        $scope.$emit('compareVal', compareVal);
        $scope.cartData = response.data.cartData;
        $scope.length = $scope.cartData.products.length;
        if(response.data.promoData) {
          $scope.discount = response.data.promoData.discount;
        }
        var someDate = new Date();
        someDate.setDate(someDate.getDate() + 15);
        $scope.estimatedDate = someDate.toISOString().substr(0, 10);
        // $scope.updateTotalPrice();
        $scope.cart = $scope.cartData.products;

        $scope.isGift = $scope.cartData.isGift;
        if($scope.isGift) {
          
          $scope.item.giftMessage = $scope.cartData.giftMessage;
        }
        $scope.totalPrice = response.data.cartData.totalPrice;
        $scope.products = response.data.cartData.products; 
        $scope.productImgDimension = [];
        for (var i = 0; i < $scope.products.length; i++) {
          var artImgSize = {};
          var sizess = {};
          sizess = $scope.cartData.products[i].artData.artSizeCatagory.artSize;
          artImgSize.width = (sizess.width / 2.54) * 150;
          artImgSize.height = (sizess.height / 2.54) * 150;
          if (Math.round(artImgSize.height) > Math.round(artImgSize.width)) {
            $scope.imageType = "PORTRAIT";
          } else if (Math.round(artImgSize.width) > Math.round(artImgSize.height)) {
            $scope.imageType = "LANDSCAPE";
          } else if (Math.round(artImgSize.width) == Math.round(artImgSize.height)) {
            $scope.imageType = "SQUAR";
          } else {
            $scope.imageType = "PANAROMIC";
          }
          $scope.productImgDimension.push(artImgSize);

        }
        $scope.$emit('cartVal', $scope.length);
        $scope.obj.loading = false;
      } else {
        $scope.length = 0;
        $scope.$emit('cartVal', $scope.length);
      }
    }, function errorCB(response) {
      delete $scope.cartData;
      delete $scope.products; 
      $scope.cartData = {};
      $scope.products = {};
      $scope.obj.loading = false;
      $scope.length = 0;
    });
  }


  $scope.getSize = function(sizeId) {
    var data = {};
    data._id = sizeId;
    cartServices.getFrameSize(data).then(function(response) {
      if (response.data.status == 200) {
        var sizess = response.data.artSize;
        $scope.artSize = response.data.artSize;
      } else {
        console.log(response.data.message);
      }
    });
  }



  $scope.addInstruction = function(id, data) {
    var value = {};
    value.productId = id;
    value.instruction = data;
    cartServices.productInstruction(value).then(function successResp(response) {
      $state.go($state.current, {}, {
        reload: true
      }); //second parameter is for $stateParams
    }, function errorResp(response) {
      console.log("TheError Reponse in instruction is : ", response);
    });
  }



  $scope.deleteProductValue = function(id) {
    var data = {};
    data.productId = id;
    cartServices.deleteProduct(data).then(function successResp(response) {
      $state.go($state.current, {}, {
        reload: true
      }); //second parameter is for $stateParams
    }, function errResp(response) {
      console.log("The error response in deleteProductValue is : ", response);
    });
  }



  $scope.deleteAndEdit = function(id) {
    var data = {};
    data.productId = id;
    cartServices.deleteProduct(data).then(function successResp(response) {
      $state.go('user.editImage');
    }, function errResp(response) {
      console.log("The error response in deleteProductValue is : ", response);
    });
  }

  $scope.isGiftMessage = function(isGift) {
    if(!isGift) {
      $scope.item.giftMessage = "";
    }
  }

  $scope.duplicateProduct = function(id) {
    var value = {};
    value.productId = id;
    cartServices.makeDuplicateProduct(value).then(function successResp(response) {
      $state.go($state.current, {}, {
        reload: true
      }); //second parameter is for $stateParams
    }, function errorResp(response) {
      console.log("TheError Reponse in duplicate Product is : ");
    });
  }



  $scope.updateCart = function(item, data) {
    if(item.giftMessage) {
      cartServices.addGiftMessage(item).then(function succ(resp) {
        console.log("The Success Response is : ");
      }, function eerr(resp) {
        console.log("Not Updated with Gift Me");
      })
    }
    if ($scope.quantitys.length == 0) {
      $scope.updateCartPrice();
    } 
    else {
      var length = $scope.quantitys.length;
      var newQuantity = [];
      for (var i = 0; i < length; i++) {
        if ($scope.quantitys[i] != undefined) {
          newQuantity.push($scope.quantitys[i]);
        }
      }
      if (newQuantity.length != 0) {
        cartServices.updateQuantity(newQuantity).then(function succResp(response) {
          $scope.obj.loading = false;
          $state.go('user.checkout');
        }, function errResp(response) {
          $scope.obj.loading = false;
        });
      }
    }

  }



  $scope.updateCartPrice = function() {
    cartServices.updateCartPrice().then(function succResp(response) {
      $state.go('user.checkout');
      $scope.obj.loading = false;
    }, function errResp(response) {
      $scope.obj.loading = false;
    });
  }

  $scope.updateMailinType = function(data,mailinType){
    var obj = {};
    obj.id = data;
    obj.mailinType = mailinType 
    cartServices.updateMailinType(obj).then(function(response){
        if(response){
          console.log("Mailin Type updated successfully");
        }
    },function(error){
         console.log("Error updating mailinType");
    })
  }

    $scope.changeQuantity = function(quantity, id, index) {
      $scope.quantity = {};
      $scope.quantity.id = id;
      $scope.quantity.quant = quantity;
      $scope.quantitys[index] = $scope.quantity;
      $scope.totalPrice = $scope.totalPrice * quantity;
    }


    
    $scope.getETA = function() {
      cartServices.checkOutDate().then(function succResp(response) {
        $scope.dateETA = response.data.etaData.estimatedDays;
      }, function errorResp(response) {
      });
    }




  $scope.applyPromo = function(promo) {
    var data = {};
    data.promoCode = promo.toLowerCase();
    cartServices.applyPromoCode(data).then(function success(response) {
      $scope.discount = response.data.promoData.discount;
      $state.go($state.current, {}, {reload: true}); //second parameter is for $stateParams
      toastr.success(response.data.message);
    }, function unSuccess(response) {
      // $state.go($state.current, {}, {reload: true}); //second parameter is for $stateParams
      toastr.error(response.data.message);
    });
  }

});



angular.module("framebridge").directive('previewCanvasCart', ['$location', function($location) {
  return {

    scope: {
      productimage: '@',
      frameimage: '@',
      frameid: '@',
      artsize: '@',
      matcolor: '@',
      productw: '@',
      producth: '@'
    },

    //template: "<canvas id='"+frameid+"' />",
    restrict: "E",
    link: function(scope, element, attrs) {

      scope.$watchGroup(['productimage', 'frameimage', 'frameid', 'artsize', 'matcolor', 'productw', 'producth'], function(productimage) {
        imageUrl = productimage['0'];
        frameUrl = productimage['1'];
        frameId = productimage['2'];
        artSize = productimage['3'];
        colorData = productimage['4'];
        productW = productimage['5'];
        productH = productimage['6'];
        if (colorData == '') {
          colorData = '#FFF';
          artSize = 'XXL';
        }
        if (frameId != '' && frameId) {
          
          drawImage(imageUrl, frameUrl, frameId, artSize, colorData, productW, productH);
        }

      }, true);

      function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
        var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        var rtnWidth = srcWidth * ratio;
        var rtnHeight = srcHeight * ratio;
        return {
          width: rtnWidth,
          height: rtnHeight,
          ratio
        };
      }


      function drawImage(imageUrl, frameUrl, frameId, artSize, colorData, productW, productH) {

        var canvas = document.getElementById(frameId);

        if (imageUrl) {
          var imageObj = new Image();
          var imageObj1 = new Image();
          url = $location.protocol() + '://' + $location.host() + ':' + $location.port();

          imageObj1.src = url + imageUrl;
          // uploadedImage = url + imageUrl
          var frameImage = '';
          if(Math.round(productH) > Math.round(productW)) {
            frameImage = url + '/images/frames/PORTRAIT/' + frameUrl;
          } else if(Math.round(productW) > Math.round(productH)) {
            frameImage = url + '/images/frames/LANDSCAPE/' + frameUrl;
          } else if(Math.round(productW) == Math.round(productH)) {
            frameImage = url + '/images/frames/SQUAR/' + frameUrl;
          } else {
            frameImage = url + '/images/frames/PANAROMIC/' + frameUrl;
          }
        
          imageObj1.onload = function() {

            canvas.width = 140;
            canvas.height = 144;

            var parentWidth = 140; //self._widgetSize[0];
            var parentHeight = 144; //self._widgetSize[1];


            var imgSize = calculateAspectRatioFit(productW, productH, parentWidth, parentHeight);

            var ctx = canvas.getContext("2d");

            canvas.width = imgSize.width;
            canvas.height = imgSize.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = colorData;
           
            ctx.fillRect(0, 0, canvas.width, canvas.height);
             
            //artSize = 'M';
            if (artSize == 'XXL') {
              imgX = imgY = 5;
              imgXm = imgYm = 10;
            } else if (artSize == 'XL') {
              imgX = 20;
              imgY = 20;
              imgXm = 40;
              imgYm = 40;
            } else if (artSize == 'L') {
              imgX = 25;
              imgY = 25;
              imgXm = 50;
              imgYm = 50;
            } else if (artSize == 'M') {
              imgX = 30;
              imgY = 30;
              imgXm = 60;
              imgYm = 60;
            } else if(artSize == 'S'){
              imgX = 35;
              imgY = 35;
              imgXm = 70;
              imgYm = 70;
            } else {
              imgX = 40;
              imgY = 40;
              imgXm = 80;
              imgYm = 80;
            }
            imageObj.src = frameImage;
            imageObj.onload = function() {
              //UPLOADED
              ctx.drawImage(imageObj1, imgX, imgY, imgSize.width - imgXm, imgSize.height - imgYm)
                //FRAME
              ctx.drawImage(imageObj, 0, 0, imgSize.width, imgSize.height);
            }
          }
          // imageObj1.src = uploadedImage;
        }

      }

    }
  };
}]);
