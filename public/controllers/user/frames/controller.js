framebridge.controller('framesController', function($scope, $state, $filter, framesServices,$stateParams) {
  $scope.artSize = 'XL';
  if ($stateParams.artType == "digital") {
    $scope.frameArtType = "digital"
  } else if($stateParams.artType == "insta") {
    $scope.frameArtType = "insta"
  }else{
    $scope.frameArtType = "artWork"
  }

  $scope.frameColor = function()
  {
    framesServices.getFrameColour().then(function(response) {
        if (response.data.status == 200) {
            $scope.frame = {};
            $scope.colors = response.data.frameColours;
        } else {
            // $state.go('admin.addFrames');
            console.log("Error in Color");
        }
    });
  }



  $scope.getData = function(searchValue) {
     var jsondata={};
     jsondata.searchColor = searchValue;
     framesServices.frames(jsondata).then(function(response) {
       if(response.data.status == 200) {
         $scope.getCartImage();
         $scope.frameList = response.data.frameData;
       }
       else {
         console.log(response.data.message);
       }
     })
  }


  $scope.getCartImage = function() {
   framesServices.cartImage().then(function successCb(response) {
     var artSize = response.data.artData.artSizeCatagory[0].artSize;
     $scope.productImgDimension = {}
     $scope.productImgDimension.width = (artSize.width / 2.54) * 150;
     $scope.productImgDimension.height = (artSize.height / 2.54) * 150;
     $scope.imageType = "";
     if (Math.round($scope.productImgDimension.height) > Math.round($scope.productImgDimension.width)) {
       $scope.imageType = "PORTRAIT";
     } else if (Math.round($scope.productImgDimension.width) > Math.round($scope.productImgDimension.height)) {
       $scope.imageType = "LANDSCAPE";
     } else if (Math.round($scope.productImgDimension.width) == Math.round($scope.productImgDimension.height)) {
       $scope.imageType = "SQUAR";
     } else {
       $scope.imageType = "PANAROMIC";
     }

     var products = response.data.cartData.products;
     var length = products.length - 1;
     if(products[length].isDigital==true){
       $scope.frameType = "digital"
     }else{
       $scope.frameType = "insta"
     }

     $scope.getImageSizeCost(products[length].artId, response.data.cartData._id, products[length]._id);
     $scope.productImg = products[length]['productImage'];
     // it will get in view as : productImg.productImage
   }, function errorCb(response){
   })
 }

   $scope.pageChanged = function(newPage) {
     $scope.pagination.currentPage = newPage;
     $scope.getData();
   }



   $scope.getImageSizeCost = function(artId, cartId, prodId) {
     var data = {};
     data.artId = artId;
     data.cartId = cartId;
     data.prodId = prodId;
     framesServices.getImageSize(data).then(function succResp (response) {
       $scope.artSize = response.data.sizeCostData.frameSize;
     }, function errorResp(response) {
       console.log("the error in art is : ", response.data);
     });
   }

});



angular.module("framebridge").directive('previewCanvasFrame', ['$location', function($location) {
  return {


  scope: {
      productimage: '@',
      frameimage: '@',
      frameid: '@',
      artsize: '@',
      productw: '@',
      producth: '@'

    },

    //template: "<canvas id='"+frameid+"' />",
    restrict: "E",
    link: function(scope, element, attrs) {


    scope.$watchGroup(['productimage', 'frameimage', 'frameid', 'artsize', 'productw', 'producth'], function (productimage) {
       //alert(productimage)
       //alert(productimage)
       imageUrl = productimage['0'];
       frameUrl = productimage['1'];
       frameId = productimage['2'];
       artSize = productimage['3'];
       productW = productimage['4'];
       productH = productimage['5'];
       if(frameId !='' && frameId) {
          drawImage(imageUrl, frameUrl, frameId, productW, productH);
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

    function drawImage(imageUrl, frameUrl, frameId, productW, productH) {

        var canvas = document.getElementById(frameId);

        if (imageUrl) {
          var imageObj = new Image();
          var imageObj1 = new Image();
          url = $location.protocol() + '://' + $location.host() + ':' + $location.port();
          // console.log('WWWWWW========='+productW+ 'HHHHHHH=='+ productH, url)
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
          canvas.width = 220;
          canvas.height = 277;

          var parentWidth = 220; //self._widgetSize[0];
          var parentHeight = 277; //self._widgetSize[1];


          var imgSize = calculateAspectRatioFit(productW, productH, parentWidth, parentHeight);
          var ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = false;
          canvas.width = imgSize.width;
          canvas.height = imgSize.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          //artSize = 'M';
          if (artSize == 'XXL') {
            imgX = imgY = 10;
            imgXm = imgYm = 20;
          } else if(artSize == 'XL') {
            imgX = 25; imgY = 25;
            imgXm = 50; imgYm = 50;
          } else if(artSize == 'L') {
            imgX = 35; imgY = 35;
            imgXm = 70; imgYm = 70;
          } else if(artSize == 'M') {
            imgX = 40; imgY = 45;
            imgXm = 80; imgYm = 90;
          } else if(artSize == 'S') {
            imgX = 60; imgY = 55;
            imgXm = 120; imgYm = 110;
          } else {
            imgX = 70; imgY = 60;
            imgXm = 140; imgYm = 130; 
          }

          imageObj.onload = function() {
            //UPLOADED
            ctx.drawImage(imageObj1, imgX, imgY, imgSize.width - imgXm, imgSize.height - imgYm)
              //FRAME
            ctx.drawImage(imageObj, 0, 0, imgSize.width, imgSize.height);
          }
          imageObj.src = frameImage;
        }
      }

    }
  };

}]);
