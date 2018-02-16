framebridge.controller('framePreviewController', function($scope, $state, $stateParams, $filter, $timeout, toastr, framePreviewService) {
    $scope.artSizeTypes = "";
    $scope.art = {};
    $scope.cartData = {};
    $scope.isCompare = false;
    $scope.imageIndex = 0;
    $scope.imagetype = "canvasimage";
    var colorCode;
    $scope.frameSizesArray = {
      XS: "Insta",
      S: "Small",
      M: "Medium",
      L: "Large",
      XL: "Extra Large",
      XXL : 'Extra Extra Large'
    }; 
    $scope.obj = {};
    $scope.obj.loading = false;
    if ($stateParams.imageType == "digital") {
       $scope.frameType = "digital"
    } 
    else if($stateParams.imageType=="artWork"){
       $scope.frameType = "artWork"
    }
    else {
       $scope.frameType = "insta"
    }
    

    $scope.imageSelect = function(indexVal) {
        if(isNaN(indexVal)) {
          if(indexVal == 'canvasimage') {
            $scope.imageIndex = false;    
            $scope.imagetype = indexVal;
          } else {
            $scope.imagetype = indexVal;
            $scope.imageIndex = false;
          }
        } else {
          $scope.imageIndex = indexVal;
          if($scope.imagetype) {
            $scope.imagetype = "";
          }
        }
    }




    $scope.getFrame = function() {
      $scope.getFrameId = {};
      $scope.getFrameId.id = $stateParams.foo;
      $scope.obj.loading = true;
      framePreviewService.getFrame($scope.getFrameId).then(function(response) {
        if(response.data.status == 200) {
          $scope.framesData = response.data.frameData;
          $scope.cartData = response.data.cartData;
          var length = response.data.cartData.products.length - 1;
          $scope.itemPrice = $scope.cartData.products[length].itemPrice;
          $scope.productImage = response.data.cartData.products[length].productImage;
          $scope.artSizeCost = response.data.cartData.products[length].imageSizeCost;
          $scope.frameDataPrimary = "";

    		  ($scope.framesData.frameImages).forEach( function (arrayItem) {
    			  if(arrayItem != 'undefined' ) {
      				if(arrayItem['imageType'] ==  "PORTRAIT") {
                $scope.frameDataPrimary = arrayItem['imgPath'];
      				}
    			  }
    		  });
          $scope.productImagedata = {'productImg': $scope.productImage, 'frameImg': $scope.frameDataPrimary} ;
          $scope.frameDataPrimary = "";
          $scope.productImage = "";
          $scope.obj.loading = false;
          $scope.getMat();
          $scope.getSizeCosts();
        }
        else {
          console.log("The Data Failure is  : ", response.data);
        }
      });
    }




    $scope.getSizeCosts = function() {
      $scope.obj.loading = true;

      framePreviewService.getSizeCosts().then(function(response) {
        if (response.data.status == 200) {
            $scope.artSizeTypes = response.data.frameSizes;
            $scope.obj.loading = false;
        } else {
            $scope.obj.loading = false;
        }
      });
    }




    $scope.getMat = function() {
      $scope.obj.loading = true;
      framePreviewService.getMat().then(function(response) {
        if (response.data.status == 200) {
          if($scope.artSizeCost.frameSize == 'XXL') {
            $scope.matData = response.data.matData;
            $scope.art.matColor = response.data.matData[1]._id;
            $scope.getMatDetails($scope.art.matColor);
            // $scope.getMatDetails($scope.art.matColor);
            $scope.obj.loading = false;
          }
          else {
            $scope.matData = response.data.matData;
            $scope.art.matColor = response.data.matData[1]._id;
            $scope.getMatDetails($scope.art.matColor);
            $scope.matResp = response.data.matData[1];
            $scope.obj.loading = false;
          }
        }
        else {
            $scope.obj.loading = false;
        }
      });
    }






    $scope.getArtSizes = function() {
       $scope.obj.loading = true;
      framePreviewService.artSizes().then(function(response) {
        if(response.data.status == 200) {
          $scope.artData = response.data.artData[0];
          $scope.artSizes = $scope.artData.artSizes;
          var artSizeId = response.data.artData[0].artSizeCatagory[0].artSize._id;
          $scope.getSize(artSizeId);
          $scope.art.artSizeType = response.data.artData[0].artSizeCatagory[0].artSizeTypeId;
          $scope.obj.loading = false;
        }
        else {
          $scope.obj.loading = false;
        }
      });
    }

    $scope.getSize = function(sizeId) {
      var data = {};
      data._id = sizeId;
      $scope.obj.loading = true;
      framePreviewService.getFrameSize(data).then(function(response) {
        if (response.data.status == 200) {
          $scope.obj.loading = false;
          var sizess = response.data.artSize;
          $scope.art.artSize = sizess;
          $scope.productImgDimension = {}
          $scope.productImgDimension.width = ($scope.art.artSize.width / 2.54) * 150;
          $scope.productImgDimension.height = ($scope.art.artSize.height / 2.54) * 150;
          $scope.sizeCalculate(sizess);
          $timeout(function() {
            $scope.sizeCalculate(sizess);
          }, 2000);
          $scope.obj.loading = false;
        } else {
          $scope.obj.loading = false;
        }
      });
    }

    $scope.sizeCalculate = function(artSize)
    {
      $scope.obj.loading = true;
      var maxValue = artSize.height > artSize.width ? artSize.height : artSize.width;
      var sizeArray = $scope.artSizeTypes;
      for(var i=0; i < sizeArray.length; i++){
          if(sizeArray[i].upto.width >= maxValue && sizeArray[i].upto.height >= maxValue) {
            $scope.getValues = "";
            $scope.getValues = sizeArray[i];
            $scope.art.artSizeType = $scope.getValues;
            $scope.obj.loading = false;
            return;
          }
          if(i == sizeArray.length - 1) {
            $scope.getValues = "";
            $scope.getValues = sizeArray[i];
            $scope.art.artSizeType = $scope.getValues;
            $scope.obj.loading = false;
            return;
          }
       }
    }




    $scope.getMatDetails = function(matId) {
      var mat = {};
      mat.matID = matId;
      $scope.obj.loading = true;
      framePreviewService.matDetails(mat).then(function successCallback(response) {
          $scope.obj.loading = false;
          $scope.matResp = response.data.matData;
          $scope.matColour = $scope.matResp.color;
          colorCode = $scope.matResp.color;
          $scope.obj.loading = false;
          // $state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
        }, function errorCallback(errResp) {
            $scope.obj.loading = false;
        });
    }


    $scope.addToCart = function(values) {
      $scope.obj.loading = true;
      framePreviewService.addCart(values).then(function(response) {
        if(response.data.status == 200) {
          $scope.cartData = response.data.cartData;
          $scope.updateTotalPrice();
          $state.go('user.addToCart',{});
          $scope.obj.loading = false;
        }
        else {
          $scope.obj.loading = false;
        }
      });
    }

    $scope.updateTotalPrice = function() {
      $scope.obj.loading = true;
      framePreviewService.updateCartPrice().then(function succResp(response) {
        $scope.obj.loading = false;
      }, function errResp(response) {
        $scope.obj.loading = false;
      });
    }


    $scope.addToCompare = function(values, compareVal) {
      $scope.obj.loading = true;
      var data = {};
      data.matId = values.matColor;
      framePreviewService.addToCompare(data).then(function success(response) {
          $scope.obj.loading = false;
          $scope.isCompare = true;
          var compareVal = response.data.compareData.length;
          toastr.success("Product added to compare list");
          $scope.$emit('compareVal', compareVal);
        }, function error(response) {
          $scope.obj.loading = false;
        });
    };

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
            colorData = '#FFF'
            artSize = 'XXL';
          }
          imageUrl = imageData['productImg'];
          frameUrl = imageData['frameImg'];
          imageData = "";
          if(imageUrl && frameUrl ) {
            drawImage(imageUrl, frameUrl, colorData, artSize, productW, productH);
          }
        } catch (e) {
        }

      }, true);

      function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight, colorData) {
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
        imageObj1.src = url + imageUrl;

        if(Math.round(productH) > Math.round(productW)) {
          frameImage = url + '/images/frames/PORTRAIT/' + frameUrl;
        } else if(Math.round(productW) > Math.round(productH)) {
          frameImage = url + '/images/frames/LANDSCAPE/' + frameUrl;
        } else if(Math.round(productW) == Math.round(productH)) {
          frameImage = url + '/images/frames/SQUAR/' + frameUrl;
        } else {
          frameImage = url + '/images/frames/PANAROMIC/' + frameUrl;
        }
        canvas.width = 365;
        canvas.height = 460;

        var parentWidth = 365; //self._widgetSize[0];
        var parentHeight = 460; //self._widgetSize[1];


        var imgSize = calculateAspectRatioFit(productW, productH, parentWidth, parentHeight, colorData);
          var ctx = canvas.getContext("2d");
          canvas.width = imgSize.width;
          canvas.height = imgSize.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle  = colorData;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // artSize = 'S';
          imgX0 = imgY0 = 0;
          imgXF = 0; imgYF = 0;
          if (artSize == 'XXL') {
            if(colorData == '#FFF') {
              imgX = 40; imgY = 40;
              imgXm = 80; imgYm = 80;
              imgX0 = 40; imgY0 = 26;
              imgXF = 80; imgYF = 56;
            } else {
              imgX = imgY = 10;
              imgXm = imgYm = 20;
            }
          } else if(artSize == 'XL') {
            if(colorData == '#FFF') {
              imgX = 40; imgY = 32;
              imgXm = 85; imgYm = 72;
              imgX0 = 40; imgY0 = 20;
              imgXF = 78; imgYF = 50;
            } else {
              imgX = 40; imgY = 40;
              imgXm = 80; imgYm = 80;
            }
          } else if(artSize == 'L') {
            if(colorData == '#FFF') {
              imgX = 40; imgY = 32;
              imgXm = 80; imgYm = 72;
              imgX0 = 40; imgY0 = 20;
              imgXF = 80; imgYF = 50;
            } else {
              imgX = 55; imgY = 50;
              imgXm = 110; imgYm = 100;
            }
          } else if(artSize == 'M') {
            if(colorData == '#FFF') {
              imgX = 40; imgY = 40;
              imgXm = 80; imgYm = 80;
              imgX0 = 40; imgY0 = 30;
              imgXF = 80; imgYF = 60;
            } else {
              imgX = 60; imgY = 65;
              imgXm = 120; imgYm = 130;
            }
          } else if(artSize == 'S'){
            if(colorData == '#FFF') {
              imgX = 40; imgY = 35;
              imgXm = 80; imgYm = 80;
              imgX0 = 40; imgY0 = 20;
              imgXF = 80; imgYF = 50;
            } else {
              imgX = 70; imgY = 75;
              imgXm = 140; imgYm = 150; 
            }
          } else {
            if(colorData == '#FFF') {
              imgX = 40; imgY = 40;
              imgXm = 80; imgYm = 80;
              imgX0 = 40; imgY0 = 20;
              imgXF = 80; imgYF = 50;
            } else {
              imgX = 80; imgY = 85;
              imgXm = 160; imgYm = 170; 
            }
          }
          imageObj.onload = function() {
          //UPLOADED
          ctx.drawImage(imageObj1, imgX, imgY, imgSize.width - imgXm, imgSize.height - imgYm);
          //FRAME
          ctx.drawImage(imageObj, imgX0, imgY0, imgSize.width-imgXF, imgSize.height-imgYF);
          imageObj = {};
          imageObj1 = {};
          imgSize = {};
          imgX = "";
          imgY = "";
          imgXm = "";
          imgYm = "";
        }
        imageObj.src = frameImage;
        frameImage = "";
      }
    }
  };
}]);


angular.module("framebridge").directive('previewCanvasss', ['$location', function ($location) {
  return {
    scope: {
      productimage: '@productimage',
      matcolor: '@',
      artsize: '@',
      productw: '@',
      producth: '@'
     },
    //controller: framePreviewController,
      template: "<canvas id='myCanvasss'/>",
    restrict: "E",
      link: function(scope, element, attrs) {
          //window.onload = function() {
         attrs.$observe('matcolor', function(newValue) {
   
         })
         scope.$watchGroup(['productimage', 'matcolor', 'artsize', 'productw', 'producth'], function (productimage) {
           try {
             newImageData = JSON.parse(productimage[0]);
             newColorData = productimage[1];
             newArtSize = productimage[2];
             newProductW = productimage[3];
             newProductH = productimage[4];
             if(newColorData == '') {
               newColorData = '#FFF';
               newArtSize = 'XXL';
             }
             newImageUrl = newImageData['productImg'];
             newFrameUrl = newImageData['frameImg'];
             newImageData = "";
             if(newImageUrl && newFrameUrl ) {
               drawImage(newImageUrl, newFrameUrl, newColorData, newArtSize, newProductW, newProductH);
             }
           } catch (e) {
           }   
         }, true);
 
        function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight, newColorData) {
          var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
          var rtnWidth = srcWidth * ratio;
          var rtnHeight = srcHeight * ratio;
          return {
            width: rtnWidth,
            height: rtnHeight,
            ratio
          };
        }
  
     function drawImage(newImageUrl, newFrameUrl, newColorData, newArtSize, newProductW, newProductH) {
          var newCanvas = document.getElementById('myCanvasss');
          var newImageObj = new Image();
          var newImageObj1 = new Image();
          url = $location.protocol() + '://' + $location.host() + ':' + $location.port();
          newImageObj1.src = url + newImageUrl;
  
          if(Math.round(newProductH) > Math.round(newProductW)) {
            newFrameImage = url + '/images/frames/PORTRAIT/' + newFrameUrl;
          } else if(Math.round(newProductW) > Math.round(newProductH)) {
            newFrameImage = url + '/images/frames/LANDSCAPE/' + newFrameUrl;
          } else if(Math.round(newProductW) == Math.round(newProductH)) {
            newFrameImage = url + '/images/frames/SQUAR/' + newFrameUrl;
          } else {
            newFrameImage = url + '/images/frames/PANAROMIC/' + newFrameUrl;
          }
  
          newCanvas.width = 150;
          newCanvas.height = 200;
  
          var newParentWidth = 150; //self._widgetSize[0];
          var newParentHeight = 200; //self._widgetSize[1];
  
  
          var newImgSize = calculateAspectRatioFit(newProductW, newProductH, newParentWidth, newParentHeight, newColorData);
            var newCtx = newCanvas.getContext("2d");
            newCanvas.width = newImgSize.width;
            newCanvas.height = newImgSize.height;
            newCtx.clearRect(0, 0, newCanvas.width, newCanvas.height);
            newCtx.fillStyle  = newColorData;
            newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);
  
            // artSize = 'S';
            newImgX0 = newImgY0 = 0;
            newImgXF = 0; newImgYF = 0;
            if (newArtSize == 'XXL') {
              if(newColorData == '#FFF') {
                newImgX = 8; newImgY = 15;
                newImgXm = 12; newImgYm = 15;
                newImgX0 = 8; newImgY0 = 10;
                newImgXF = 12; newImgYF = 8;
              } else {
                newImgX = newImgY = 10;
                newImgXm = newImgYm = 20;
              }
            } else if(newArtSize == 'XL') {
              if(newColorData == '#FFF') {
                newImgX = 10; newImgY = 8;
                newImgXm = 35; newImgYm = 22;
                newImgX0 = 15; newImgY0 = 12;
                newImgXF = 28; newImgYF = 19;
              } else {
                newImgX = 18; newImgY = 18;
                newImgXm = 36; newImgYm = 34;
              }
            } else if(newArtSize == 'L') {
              if(newColorData == '#FFF') {
                newImgX = 20; newImgY = 29;
                newImgXm = 20; newImgYm =17;
                newImgX0 = 20; newImgY0 = 20;
                newImgXF = 20; newImgYF = 27;
              } else {
                newImgX = 30; newImgY = 32;
                newImgXm = 60; newImgYm = 62;
              }
            } else if(newArtSize == 'M') {
              if(newColorData == '#FFF') {
                newImgX = 20; newImgY = 20;
                newImgXm = 40; newImgYm = 40;
                newImgX0 = 20; newImgY0 = 15;
                newImgXF = 40; newImgYF = 30;
              } else {
                newImgX = 35; newImgY = 37;
                newImgXm = 70; newImgYm = 75;
              }
            } else if(newArtSize == 'S'){
              if(newColorData == '#FFF') {
                newImgX = 10; newImgY = 15;
                newImgXm = 20; newImgYm = 20;
                newImgX0 = 10; newImgY0 = 5;
                newImgXF = 20; newImgYF = 16;
              } else {
                newImgX = 35; newImgY = 45;
                newImgXm = 71; newImgYm = 90; 
              }
            } else {
              if(newColorData == '#FFF') {
                newImgX = 20; newImgY = 20;
                newImgXm = 30; newImgYm = 30;
                newImgX0 = 20; newImgY0 = 20;
                newImgXF = 40; newImgYF = 30;
              } else {
                newImgX = 30; newImgY = 25;
                newImgXm = 50; newImgYm = 60; 
              }
            }
            newImageObj.onload = function() {
            //UPLOADED
            newCtx.drawImage(newImageObj1, newImgX, newImgY, newImgSize.width - newImgXm, newImgSize.height - newImgYm);
            //FRAME
            newCtx.drawImage(newImageObj, newImgX0, newImgY0, newImgSize.width - newImgXF, newImgSize.height - newImgYF);
            
            // newImageObj = {}; 
            // newImageObj1 = {};
            // newImgSize = {};
            // newImgX = "";
            // newImgY = "";
            // newImgXm = "";
            // newImgYm = "";
          }
          newImageObj.src = newFrameImage;
          newFrameImage = "";
        }
      }
    };
  }]);


angular.module("framebridge").directive('wallCanvas', ['$location', function ($location) {
  return {
    scope: {
      productimage: '@productimage',
      matcolor: '@',
      artsize: '@',
      productw: '@',
      producth: '@'
      },
    //controller: framePreviewController,
      template: "<canvas id='myWallCanvas'/>",
    restrict: "E",
      link: function(scope, element, attrs) {
          //window.onload = function() {
          attrs.$observe('matcolor', function(newValue) {
    
          })
          scope.$watchGroup(['productimage', 'matcolor', 'artsize', 'productw', 'producth'], function (productimage) {
            try {
              wallImageData = JSON.parse(productimage[0]);
              wallColorData = productimage[1];
              wallArtSize = productimage[2];
              wallProductW = productimage[3];
              wallProductH = productimage[4];
              if(wallColorData == '') {
                wallColorData = '#FFF';
                wallArtSize = 'XXL';
              }
              wallImageUrl = wallImageData['productImg'];
              wallFrameUrl = wallImageData['frameImg'];
              wallImageData = "";
              if(wallImageUrl && wallFrameUrl ) {
                drawImage(wallImageUrl, wallFrameUrl, wallColorData, wallArtSize, wallProductW, wallProductH);
              }
            } catch (e) {
            }   
          }, true);
  
        function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight, wallColorData) {
          var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
          var rtnWidth = srcWidth * ratio;
          var rtnHeight = srcHeight * ratio;
          return {
            width: rtnWidth,
            height: rtnHeight,
            ratio
          };
        }
  
      function drawImage(wallImageUrl, wallFrameUrl, wallColorData, wallArtSize, wallProductW, wallProductH) {
          var wallCanvas = document.getElementById('myWallCanvas');
          var wallImageObj = new Image();
          var wallImageObj1 = new Image();
          url = $location.protocol() + '://' + $location.host() + ':' + $location.port();
          wallImageObj1.src = url + wallImageUrl;
  
          if(Math.round(wallProductH) > Math.round(wallProductW)) {
            wallFrameImage = url + '/images/frames/PORTRAIT/' + wallFrameUrl;
          } else if(Math.round(wallProductW) > Math.round(wallProductH)) {
            wallFrameImage = url + '/images/frames/LANDSCAPE/' + wallFrameUrl;
          } else if(Math.round(wallProductW) == Math.round(wallProductH)) {
            wallFrameImage = url + '/images/frames/SQUAR/' + wallFrameUrl;
          } else {
            wallFrameImage = url + '/images/frames/PANAROMIC/' + wallFrameUrl;
          }
  
          wallCanvas.width = 50;
          wallCanvas.height = 60;
  
          var wallParentWidth = 50; //self._widgetSize[0];
          var wallParentHeight = 60; //self._widgetSize[1];
  
  
          var wallImgSize = calculateAspectRatioFit(wallProductW, wallProductH, wallParentWidth, wallParentHeight, wallColorData);
            var wallCtx = wallCanvas.getContext("2d");
            wallCanvas.width = wallImgSize.width;
            wallCanvas.height = wallImgSize.height;
            wallCtx.clearRect(0, 0, wallCanvas.width, wallCanvas.height);
            wallCtx.fillStyle  = wallColorData;
            wallCtx.fillRect(0, 0, wallCanvas.width, wallCanvas.height);
  
            // artSize = 'S';
            wallImgX0 = wallImgY0 = 0;
            wallImgXF = 0; wallImgYF = 0;
            if (wallArtSize == 'XXL') {
              if(wallColorData == '#FFF') {
                wallImgX = 8; wallImgY = 15;
                wallImgXm = 12; wallImgYm = 15;
                wallImgX0 = 8; wallImgY0 = 10;
                wallImgXF = 12; wallImgYF = 8;
              } else {
                wallImgX = wallImgY = 10;
                wallImgXm = wallImgYm = 20;
              }
            } else if(wallArtSize == 'XL') {
              if(wallColorData == '#FFF') {
                wallImgX = 10; wallImgY = 8;
                wallImgXm = 35; wallImgYm = 22;
                wallImgX0 = 15; wallImgY0 = 12;
                wallImgXF = 28; wallImgYF = 19;
              } else {
                wallImgX = 8; wallImgY = 9;
                wallImgXm = 16; wallImgYm = 15;
              }
            } else if(wallArtSize == 'L') {
              if(wallColorData == '#FFF') {
                alert("Herer");
                wallImgX = 20; wallImgY = 29;
                wallImgXm = 20; wallImgYm =17;
                wallImgX0 = 20; wallImgY0 = 20;
                wallImgXF = 20; wallImgYF = 27;
              } else {
                // wallImgX = 10; wallImgY = 26;
                // wallImgXm = 20; wallImgYm = 50;
                wallImgX = 10; wallImgY = 15;
                wallImgXm = 20; wallImgYm = 25;
              }
            } else if(wallArtSize == 'M') {
              if(wallColorData == '#FFF') {
                wallImgX = 20; wallImgY = 20;
                wallImgXm = 40; wallImgYm = 40;
                wallImgX0 = 20; wallImgY0 = 15;
                wallImgXF = 40; wallImgYF = 30;
              } else {
                // wallImgX = 35; wallImgY = 37;
                // wallImgXm = 70; wallImgYm = 75;
                wallImgX = 23; wallImgY = 45;
                wallImgXm = 45; wallImgYm = 90;
              }
            } else if(wallArtSize == 'S'){
              if(wallColorData == '#FFF') {
                wallImgX = 10; wallImgY = 15;
                wallImgXm = 20; wallImgYm = 20;
                wallImgX0 = 10; wallImgY0 = 5;
                wallImgXF = 20; wallImgYF = 16;
              } else {
                wallImgX = 12; wallImgY = 15;
                wallImgXm = 25; wallImgYm = 30; 
              }
            } else {
              if(wallColorData == '#FFF') {
                alert("No Here");
                wallImgX = 20; wallImgY = 20;
                wallImgXm = 30; wallImgYm = 30;
                wallImgX0 = 20; wallImgY0 = 20;
                wallImgXF = 40; wallImgYF = 30;
              } else {
                wallImgX = 30; wallImgY = 20;
                wallImgXm = 50; wallImgYm = 60; 
              }
            }
            wallImageObj.onload = function() {
            //UPLOADED
            wallCtx.drawImage(wallImageObj1, wallImgX, wallImgY, wallImgSize.width - wallImgXm, wallImgSize.height - wallImgYm);
            //FRAME
            wallCtx.drawImage(wallImageObj, wallImgX0, wallImgY0, wallImgSize.width - wallImgXF, wallImgSize.height - wallImgYF);
            
            // wallImageObj = {}; 
            // wallImageObj1 = {};
            // wallImgSize = {};
            // wallImgX = "";
            // wallImgY = "";
            // wallImgXm = "";
            // wallImgYm = "";
          }
          wallImageObj.src = wallFrameImage;
          wallFrameImage = "";
        }
      }
    };
  }]);


angular.module("framebridge").directive('wallCanvasss', ['$location', function ($location) {
  return {
    scope: {
      productimage: '@productimage',
      matcolor: '@',
      artsize: '@',
      productw: '@',
      producth: '@'
      },
    //controller: framePreviewController,
      template: "<canvas id='myWallCanvasss'/>",
    restrict: "E",
      link: function(scope, element, attrs) {
          //window.onload = function() {
          attrs.$observe('matcolor', function(newValue) {
    
          })
          scope.$watchGroup(['productimage', 'matcolor', 'artsize', 'productw', 'producth'], function (productimage) {
            try {
              newWallImageData = JSON.parse(productimage[0]);
              newWallColorData = productimage[1];
              newWallArtSize = productimage[2];
              newWallProductW = productimage[3];
              newWallProductH = productimage[4];
              if(newWallColorData == '') {
                newWallColorData = '#FFF';
                newWallArtSize = 'XXL';
              }
              newWallImageUrl = newWallImageData['productImg'];
              newWallFrameUrl = newWallImageData['frameImg'];
              newWallImageData = "";
              if(newWallImageUrl && newWallFrameUrl ) {
                drawImage(newWallImageUrl, newWallFrameUrl, newWallColorData, newWallArtSize, newWallProductW, newWallProductH);
              }
            } catch (e) {
            }   
          }, true);
  
        function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight, newWallColorData) {
          var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
          var rtnWidth = srcWidth * ratio;
          var rtnHeight = srcHeight * ratio;
          return {
            width: rtnWidth,
            height: rtnHeight,
            ratio
          };
        }
  
      function drawImage(newWallImageUrl, newWallFrameUrl, newWallColorData, newWallArtSize, newWallProductW, newWallProductH) {
          var newWallCanvas = document.getElementById('myWallCanvasss');
          var newWallImageObj = new Image();
          var newWallImageObj1 = new Image();
          url = $location.protocol() + '://' + $location.host() + ':' + $location.port();
          newWallImageObj1.src = url + newWallImageUrl;
  
          if(Math.round(newWallProductH) > Math.round(newWallProductW)) {
            newWallFrameImage = url + '/images/frames/PORTRAIT/' + newWallFrameUrl;
          } else if(Math.round(newWallProductW) > Math.round(newWallProductH)) {
            newWallFrameImage = url + '/images/frames/LANDSCAPE/' + newWallFrameUrl;
          } else if(Math.round(newWallProductW) == Math.round(newWallProductH)) {
            newWallFrameImage = url + '/images/frames/SQUAR/' + newWallFrameUrl;
          } else {
            newWallFrameImage = url + '/images/frames/PANAROMIC/' + newWallFrameUrl;
          }
  
          newWallCanvas.width = 110;
          newWallCanvas.height = 130;
  
          var newWallParentWidth = 110; //self._widgetSize[0];
          var newWallParentHeight = 130; //self._widgetSize[1];
  
  
          var newWallImgSize = calculateAspectRatioFit(newWallProductW, newWallProductH, newWallParentWidth, newWallParentHeight, newWallColorData);
            var newWallCtx = newWallCanvas.getContext("2d");
            newWallCanvas.width = newWallImgSize.width;
            newWallCanvas.height = newWallImgSize.height;
            newWallCtx.clearRect(0, 0, newWallCanvas.width, newWallCanvas.height);
            newWallCtx.fillStyle  = newWallColorData;
            newWallCtx.fillRect(0, 0, newWallCanvas.width, newWallCanvas.height);
  
            // artSize = 'S';
            newWallImgX0 = newWallImgY0 = 0;
            newWallImgXF = 0; newWallImgYF = 0;
            if (newWallArtSize == 'XXL') {
              if(newWallColorData == '#FFF') {
                newWallImgX = 8; newWallImgY = 15;
                newWallImgXm = 12; newWallImgYm = 15;
                newWallImgX0 = 8; newWallImgY0 = 10;
                newWallImgXF = 12; newWallImgYF = 8;
              } else {
                newWallImgX = newWallImgY = 10;
                newWallImgXm = newWallImgYm = 20;
              }
            } else if(newWallArtSize == 'XL') {
              if(newWallColorData == '#FFF') {
                newWallImgX = 10; newWallImgY = 8;
                newWallImgXm = 35; newWallImgYm = 22;
                newWallImgX0 = 15; newWallImgY0 = 12;
                newWallImgXF = 28; newWallImgYF = 19;
              } else {
                newWallImgX = 15; newWallImgY = 15;
                newWallImgXm = 30; newWallImgYm = 30;
              }
            } else if(newWallArtSize == 'L') {
              if(newWallColorData == '#FFF') {
                newWallImgX = 20; newWallImgY = 29;
                newWallImgXm = 20; newWallImgYm =17;
                newWallImgX0 = 20; newWallImgY0 = 20;
                newWallImgXF = 20; newWallImgYF = 27;
              } else {
                newWallImgX = 20; newWallImgY = 20;
                newWallImgXm = 40; newWallImgYm = 40;
              }
            } else if(newWallArtSize == 'M') {
              if(newWallColorData == '#FFF') {
                newWallImgX = 20; newWallImgY = 20;
                newWallImgXm = 40; newWallImgYm = 40;
                newWallImgX0 = 20; newWallImgY0 = 15;
                newWallImgXF = 40; newWallImgYF = 30;
              } else {
                // Changes to be do here
                // newWallImgX = 35; newWallImgY = 37;
                // newWallImgXm = 70; newWallImgYm = 75;
                newWallImgX = 22; newWallImgY = 29;
                newWallImgXm = 44; newWallImgYm = 58;
              }
            } else if(newWallArtSize == 'S'){
              if(newWallColorData == '#FFF') {
                newWallImgX = 10; newWallImgY = 15;
                newWallImgXm = 20; newWallImgYm = 20;
                newWallImgX0 = 10; newWallImgY0 = 5;
                newWallImgXF = 20; newWallImgYF = 16;
              } else {
                newWallImgX = 35; newWallImgY = 45;
                newWallImgXm = 71; newWallImgYm = 90; 
              }
            } else {
              if(newWallColorData == '#FFF') {
                newWallImgX = 20; newWallImgY = 20;
                newWallImgXm = 30; newWallImgYm = 30;
                newWallImgX0 = 20; newWallImgY0 = 20;
                newWallImgXF = 40; newWallImgYF = 30;
              } else {
                newWallImgX = 30; newWallImgY = 25;
                newWallImgXm = 50; newWallImgYm = 60; 
              }
            }
            newWallImageObj.onload = function() {
            //UPLOADED
            newWallCtx.drawImage(newWallImageObj1, newWallImgX, newWallImgY, newWallImgSize.width - newWallImgXm, newWallImgSize.height - newWallImgYm);
            //FRAME
            newWallCtx.drawImage(newWallImageObj, newWallImgX0, newWallImgY0, newWallImgSize.width - newWallImgXF, newWallImgSize.height - newWallImgYF);
            
            // newWallImageObj = {}; 
            // newWallImageObj1 = {};
            // newWallImgSize = {};
            // newWallImgX = "";
            // newWallImgY = "";
            // newWallImgXm = "";
            // newWallImgYm = "";
          }
          newWallImageObj.src = newWallFrameImage;
          newWallFrameImage = "";
        }
      }
    };
  }]);