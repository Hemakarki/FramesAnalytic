framebridge.controller('compareController', function($scope, $state, $stateParams, $timeout, toastr, compareServices) {
   console.log("Inside compare Controller"); 

    $scope.obj = {};
    $scope.items = {};
    $scope.artSizeTypes = [];
    $scope.compareData = {};
    var selectedIndex = 0;
    $scope.frameSizesArray = {'XS' : 'Insta', 'S' : 'Small', 'M' : 'Medium', 'L' : 'Large', 'XL' : 'Extra Large', 'XXL' : 'Extra Extra Large'};

    $scope.getProducts = function() {
        $scope.getSizeCosts();
        $scope.obj.loading = true;
        compareServices.getCompareProducts().then(function success(response) {
            console.log("The Products Listing is : ", response.data.compareData);
            $scope.items = response.data.compareData;
            $scope.compareData = response.data.compareData[selectedIndex];
            $scope.productImage = $scope.compareData.products.productImage;
            var sizess = $scope.compareData.artData.artSizeCatagory.artSize;
            $scope.sizeCalculate(sizess);
            $scope.frameDataPrimary = "";
            ($scope.compareData.frameData.frameImages).forEach( function (arrayItem) {
                if(arrayItem != 'undefined' ) {
                    if(arrayItem['isPrimary'] == true) {
                        $scope.frameDataPrimary = arrayItem['imgPath'];
                    }
                }
            });
            $scope.productImagedata = {'productImg': $scope.productImage, 'frameImg': $scope.frameDataPrimary} ;
            $scope.obj.loading = false;
        }, function error(response) {
            console.log("Error in products Listing is : ", response.data)
            $scope.obj.loading = false;
        });
    }

      

    $scope.viewIndex = function(index) {
        $scope.compareData = {};
        $scope.productImage = {};
        selectedIndex = index;
        $scope.getProducts();
        $scope.getProducts();
    }


    $scope.removeCompare = function() {
        var data = {};
        data.index = selectedIndex;
        compareServices.removeProduct(data).then(function success(response) {
            console.log("removeProduct response is : ", response);
            if(response.data.compareData.length) {
                $state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
            } else {
                var compareVal = 0;
                $scope.$emit('compareVal', compareVal);
            }
            $scope.obj.loading = false;
        }, function error(response) {
            var compareVal = 0;
            $scope.$emit('compareVal', compareVal);
            $state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
            $scope.obj.loading = false;
        });
    }


    $scope.resetCompare = function() {
        $scope.obj.loading = true;
        $state.go('user.framesType');
    }

    $scope.getSizeCosts = function() {
        $scope.obj.loading = true;
        compareServices.getSizeCosts().then(function(response) {
            if (response.data.status == 200) {
                $scope.artSizeTypes = response.data.frameSizes;
                $scope.obj.loading = false;
            } else {
                $scope.obj.loading = false;
            }
        });
    }




    $scope.sizeCalculate = function(artSize) {
    $scope.obj.loading = true;
    var maxValue = artSize.height > artSize.width ? artSize.height : artSize.width;
    var sizeArray = $scope.artSizeTypes;
    for(var i=0; i < sizeArray.length; i++){
        if(sizeArray[i].upto.width >= maxValue && sizeArray[i].upto.height >= maxValue) {
            $scope.getValues = "";
            $scope.getValues = sizeArray[i];
            $scope.artsSize = $scope.getValues;
            $scope.obj.loading = false;
            return;
        }
        if(i == sizeArray.length - 1) {
            $scope.getValues = "";
            $scope.getValues = sizeArray[i];
            $scope.artsSize = $scope.getValues;
            $scope.obj.loading = false;
            return;
        }
        }
    }


    $scope.updateTotalPrice = function() {
        compareServices.updateCartPrice().then(function succResp(response) {
            $scope.obj.loading = false;
            $state.go('user.addToCart',{});
        }, function errResp(response) {
            $scope.obj.loading = false;
        });
    }

    $scope.addToCart = function() {
        var data = {};
        data.productId = $scope.items[selectedIndex].products._id;
        data.cartId = $scope.items[selectedIndex]._id;
        compareServices.addToCartProduct(data).then(function success (response) {
            $scope.updateTotalPrice();
            toastr.success("Added to cart");
            }, function error(response) {
            toastr.error("Can't added to cart");
        });
    }



});




angular.module("framebridge").directive('previewCanvas', ['$location', function ($location) {
    return {
     scope: {
        productimage: '@productimage',
        matcolor: '@',
        artsize: '@',
        productw: '@',
        producth: '@'
      },
     //controller: framePreviewController,
       template: "<canvas id='myCanvas' />",
     restrict: "E",
       link: function(scope, element, attrs) {
           //window.onload = function() {
          attrs.$observe('matcolor', function(newValue) {
    
          })
          scope.$watchGroup(['productimage', 'matcolor', 'artsize', 'productw', 'producth'], function (productimage) {
    
            try {
              imageData = JSON.parse(productimage[0]);
              colorData = productimage[1];
              artSize = productimage[2];
    
              productW = productimage['3'];
              productH = productimage['4'];
              if(colorData == '') {
                colorData = '#FFF';
                artSize = 'XXL';
              }
              imageUrl = imageData['productImg'];
              frameUrl = imageData['frameImg'];
    
              if(imageUrl && frameUrl ) {
                drawImage(imageUrl, frameUrl, colorData, artSize, productW, productH);
              }
            } catch (e) {}
    
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
    
       function drawImage(imageUrl, frameUrl, colorData, artSize, productW, productH) {
    
            var canvas = document.getElementById('myCanvas');
            var imageObj = new Image();
            var imageObj1 = new Image();
            url = $location.protocol() + '://' + $location.host() + ':' + $location.port();
            uploadedImage = url + imageUrl
    
            if(Math.round(productH) > Math.round(productW)) {
              frameImage = url + '/images/frames/PORTRAIT/' + frameUrl;
            } else if(Math.round(productW) > Math.round(productH)) {
              frameImage = url + '/images/frames/LANDSCAPE/' + frameUrl;
            } else if(Math.round(productW) == Math.round(productH)) {
              frameImage = url + '/images/frames/SQUAR/' + frameUrl;
            } else {
              frameImage = url + '/images/frames/PANAROMIC/' + frameUrl;
            }
    
            imageObj1.src = uploadedImage;
    
    
            canvas.width = 365;
            canvas.height = 460;
    
            var parentWidth = 365; //self._widgetSize[0];
            var parentHeight = 460; //self._widgetSize[1];
    
    
            var imgSize = calculateAspectRatioFit(productW, productH, parentWidth, parentHeight);
    
              var ctx = canvas.getContext("2d");
              canvas.width = imgSize.width;
              canvas.height = imgSize.height;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle  = colorData;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              // artSize = 'S';
              if (artSize == 'XXL') {
                imgX = imgY = 10;
                imgXm = imgYm = 20;
              } else if(artSize == 'XL') {
                imgX = 40; imgY = 40;
                imgXm = 80; imgYm = 80;
              } else if(artSize == 'L') {
                imgX = 55; imgY = 50;
                imgXm = 110; imgYm = 100;
              } else if(artSize == 'M') {
                imgX = 60; imgY = 65;
                imgXm = 120; imgYm = 130;
              } else if(artSize == 'S') {
                imgX = 70; imgY = 75;
                imgXm = 140; imgYm = 150; 
              } else {
                imgX = 80; imgY = 85;
                imgXm = 160; imgYm = 170; 
              }
              imageObj.onload = function() {
              //UPLOADED
              ctx.drawImage(imageObj1, imgX, imgY, imgSize.width - imgXm, imgSize.height - imgYm);
              //FRAME
              ctx.drawImage(imageObj, 0, 0, imgSize.width, imgSize.height);
            }
            imageObj.src = frameImage;
          }
    
        }
    
      }
    }]);
    