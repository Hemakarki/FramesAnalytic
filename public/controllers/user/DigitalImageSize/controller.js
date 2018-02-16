framebridge.controller('dgImgSizeController', function($scope, $state, $stateParams, $filter, $timeout, dgImgServices, $rootScope) {
  $scope.art = {};
  $scope.art.artSize = {};
  $scope.art.height = {};
  $scope.art.width = {};
  $scope.art.artPrice;
  $scope.art.artSizeType;
  $scope.sizeArray = [];
  $scope.artSizeTypes = [];
  $scope.start = false;
  $scope.prodId = "";
  $scope.obj = {};
  $scope.isDigitalPage = false;
  $scope.artWork = false;
  $scope.heightValues = [];
  $scope.widthValues = [];


  if ($stateParams.imageType == "digital") {
    $scope.frameArtType = "digital"
    $scope.isDigitalPage = true;
    $scope.artType = false;
  } else if ($stateParams.imageType == "insta") {
    $scope.frameArtType = "insta"
    $scope.isDigitalPage = false;
    $scope.artType = false;
  } else {
    $scope.frameArtType = "artWork"
    $scope.isDigitalPage = true;
    $scope.artType = true;
  }



  $scope.sizeChange = function(width, height) {
    $scope.artSizes = {};
    $scope.artSizes.height = $scope.art.height;
    $scope.artSizes.width = $scope.art.width;
    $scope.sizeCalculate($scope.artSizes);
  }




  $scope.getImageSize = function() {
    $scope.obj.loading = true;
    dgImgServices.getCart().then(function success(response) {
        $scope.obj.loading = false;
        if(!response.data.cartData.products.length) {
          var index = 0;
        } else {
         var index = response.data.cartData.products.length - 1;
        }
        var products = response.data.cartData.products;
        if (products[index].artType == "Digital"||products[index].artType == "Instagram") {
        $scope.artWork = false;
          if (products[index].isDigital == false) {
            $scope.artType = "insta"
          } else {
            $scope.artType = "digital"
          }
          $scope.prodId = response.data.cartData.products[index]._id;
          var imageSize = response.data.cartData.products[index].imageSize;
          $scope.image = products[index].productImage;
          var minImageSizes = {};
          var maxImageSizes = {};

          if($scope.artType == "insta") {
            maxImageSizes.width = ((imageSize.width * 2.54) / 150);
            maxImageSizes.height = ((imageSize.height * 2.54) / 150);
  
            var sizes = {};
            sizes.width = maxImageSizes.width;
            sizes.height = maxImageSizes.height;
            $scope.sizeArray.push(sizes);
            $scope.artSizes($scope.sizeArray);
            $scope.getSizeCosts();
            $scope.obj.loading = false;

          } else {
            maxImageSizes.width = ((imageSize.width * 2.54) / 100);
            maxImageSizes.height = ((imageSize.height * 2.54) / 100);
  
            minImageSizes.width = ((imageSize.width * 2.54) / 300);
            minImageSizes.height = ((imageSize.height * 2.54) / 300);

            var aspectRatio = minImageSizes.width / minImageSizes.height;
            for (var i = minImageSizes.width; i < maxImageSizes.width; i += 4) {
              var sizes = {};
              sizes.width = i;
              sizes.height = (i / aspectRatio);
              $scope.sizeArray.push(sizes);
              if (i + 3 > maxImageSizes.width) {
                $scope.artSizes($scope.sizeArray);
              }
            }
            $scope.getSizeCosts();
            $scope.obj.loading = false;
          }
        } else {
          $scope.artType = products[index].artType
          $scope.prodId = response.data.cartData.products[index]._id;
          var imageSize = response.data.cartData.products[index].imageSize;
          $scope.image = products[index].productImage;
          $scope.artWork = true;
          for (var i = 12; i < 102; i++) {
            $scope.heightDropDown = {};
            $scope.heightDropDown.id = i;
            $scope.heightDropDown.value = i;
            $scope.heightValues.push($scope.heightDropDown);
            ++i;
          }
          for(var j = 12; j < 72; j++) {
            $scope.widthDropDown = {};
            $scope.widthDropDown.id = j;
            $scope.widthDropDown.value = j;
            $scope.widthValues.push($scope.widthDropDown);
            ++j;
          }
          var heightArraylen = $scope.heightValues.length - 1;
          $scope.art.height = $scope.heightValues[heightArraylen].value;
          var widthArraylen = $scope.widthValues.length - 1;
          $scope.art.width = $scope.widthValues[widthArraylen].value;
          $scope.artSizes = {};
          $scope.artSizes.height = $scope.art.height;
          $scope.artSizes.width = $scope.art.width;
          var artObject = {};
          artObject.prodId = $scope.prodId;

          dgImgServices.saveArtSizes(artObject).then(function(response) {
            if (response.data.status == 200) {
              $timeout(function() {
                $scope.sizeCalculate($scope.artSizes);
              }, 1000);
              $scope.obj.loading = false;
            } else {
              $scope.obj.loading = false;
            }
          });
          $scope.getSizeCosts();
        }
      }, function errorFunc(response) {
        if(response.data.cartData.products.length) {
          $state.go('/');
        }
        
      });
  }

  $scope.getSizeCosts = function() {
    $scope.obj.loading = true;
    dgImgServices.getSizeCosts().then(function(response) {
      if (response.data.status == 200) {
        $scope.obj.loading = false;
        $scope.artSizeTypes = response.data.frameSizes;
        $scope.art.artSizeType = response.data.frameSizes;
      } else {
        $state.go('admin.listFrames');
        $scope.obj.loading = false;
      }
    });
  }


  $scope.artSizes = function(artValues) {
    var artsValues = {};
    artsValues.art = artValues;
    artsValues.prodId = $scope.prodId;
    $scope.obj.loading = true;
    dgImgServices.saveArtSizes(artsValues).then(function(response) {
      if (response.data.status == 200) {
        $scope.obj.loading = false;
        $scope.artSizes = response.data.artData.artSizes;
        var artLength = $scope.artSizes.length - 1;
        $scope.art.artSize = $scope.artSizes[artLength];
        $scope.sizeCalculate($scope.artSizes[artLength]);
        $timeout(function() {
          $scope.sizeCalculate($scope.artSizes[artLength]);
        }, 1000);
        $scope.obj.loading = false;
      } else {
        $scope.obj.loading = false;
      }
    });
  }



  $scope.sizeCalculate = function(artSize) {
    $scope.obj.loading = true;
    var maxValue = artSize.height > artSize.width ? artSize.height : artSize.width;
    $scope.getValues = "";
    var sizeArray = $scope.artSizeTypes;
    for (var i = 0; i < sizeArray.length; i++) {
      if (sizeArray[i].upto.width >= maxValue && sizeArray[i].upto.height >= maxValue) {
        $scope.getValues = "";
        $scope.getValues = sizeArray[i];
        $scope.art.artSizeType = $scope.getValues;
        $scope.obj.loading = false;
        return;
      } if(i == sizeArray.length - 1) {
        $scope.getValues = "";
        $scope.getValues = sizeArray[i];
        $scope.art.artSizeType = $scope.getValues;
        $scope.obj.loading = false;
        return;
      }
    }
  }

  $scope.saveInfo = function(arts) {
    $scope.artValues = {};
    if (arts.artSize.width) {
      $scope.artValues.artSize = arts.artSize;

    } else {
      $scope.artValues.artSize = {};
      $scope.artValues.artSize.width = arts.width;
      $scope.artValues.artSize.height = arts.height;
    }
    if ($scope.artType == "insta") {
      $scope.artValues.artType = "insta"
    } else if($scope.artType == "digital") {
      $scope.artValues.artType = "digital"
    }else{
      $scope.artValues.artType = "artWork"
    }

    $scope.artValues.artSizeType = arts.artSizeType;
    $scope.artValues.artPrice = arts.artPrice;
    // $scope.obj.loading = true;
    dgImgServices.newUpdateArt($scope.artValues).then(function(response) {
      if (response.data.status == 200) {
        $scope.obj.loading = false;
        var data = response.data.artData;
        if (data.artType == "insta") {
          $state.go('user.frames', {
            "artType": "insta"
          });
        } else if(data.artType == "digital") {
          $state.go('user.frames', {
            "artType": "digital"
          });
        }else{
          $state.go('user.frames',{
             "artType":"artWork"
          })
        }
      } else {
        console.log("Error getting response");
        // $scope.obj.loading = false;
      }
    });
  }



});