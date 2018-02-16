framebridge.controller('addFrameController', function($scope, $state, $stateParams, $filter, addFramesServices) {
    console.log("Inside ADd Frame Controller ");

    $scope.validImage = true;
    var sizeIndex;
    $scope.frameType = [];

    $scope.getFrameValues = function() {
        addFramesServices.getFrameColour().then(function(response) {
            if (response.data.status == 200) {
                $scope.frame = {};
                $scope.colors = response.data.frameColours;
                $scope.frame.frameColor = $scope.colors[0].frameColor;
                // $state.go('admin.listFrames');
            } else {
                $$state.go('admin.addFrames');
            }
        });
        addFramesServices.getSizeCosts().then(function(response) {
          if (response.data.status == 200) {
              $scope.frameSizes = response.data.frameSizes;
              $scope.frame.frameSize = $scope.frameSizes[0].frameSize;
              // $state.go('admin.listFrames');
          } else {
              $$state.go('admin.addFrames');
          }
        })
    }



    $scope.addFrame = function(framesValue) {
        var frameImages = [];
        if(framesValue.frameImage) {
            var i = 0;
            for(i = 0 ; i< framesValue.frameImage.length ; i++) {
                var frameImg = {};
                frameImg.imgData = framesValue.frameImage[i];
                frameImg.imageType = $scope.frameType[i].frameType;
                frameImg.isPrimary = true;
                frameImages.push(frameImg);
            }
        }
        if(framesValue.frameSecImg) {
            var j = 0;
            for(j = 0 ; j< framesValue.frameSecImg.length ; j++) {
                var frameImgSec = {};
                frameImgSec.imgData = framesValue.frameSecImg[j];
                frameImgSec.isPrimary = false;
                frameImgSec.imageType = "SECONDRY";
                frameImages.push(frameImgSec);
            }
        }
        
        if((i == framesValue.frameImage.length) && (j == framesValue.frameSecImg.length)) {
            framesValue.frameImage = frameImages;
            addFramesServices.addFrames(framesValue).then(function(response) {
                if (response.data.status == 200) {
                    $state.go('admin.listFrames');
                } else {
                    $state.go('admin.listFrames');
                }
            });
        }
    }



    $scope.validImage = function(imageData) {
        var frameImage = imageData;
        if (frameImage.filetype == "image/png" || "image/jpeg" || "image/jpg") {
            $scope.validImage = true;
        } else {
            $scope.validImage = false;
        }
    }

    $scope.addNewColor = function(newColour) {
        $scope.color = {};
        $scope.color.frameColor = newColour;
        addFramesServices.addColour($scope.color).then(function(response) {
            if (response.data.status == 200) {
                $scope.getFrameValues();
            } else {
                $scope.getFrameValues();
                // $state.go('admin.listFrames');
            }
        })
    }

    $scope.deleteColor = function(delColour) {
      $scope.color = {};
      $scope.color.frameColor = delColour;
      addFramesServices.deleteSelectedColor($scope.color).then(function succCB(sResponse) {
        $scope.getFrameValues();
      }, function errCB(dResponse) {
        $scope.getFrameValues();
      });
    }


    $scope.tempArray = ['LANDSCAPE', 'PORTRAIT','SQUAR','PANAROMIC'];
    $scope.listArray = [{"name": 'LANDSCAPE', "isDisabled" : false}, {"name":'PORTRAIT', "isDisabled" : false}, {"name":'SQUAR', "isDisabled" : false}, {"name":'PANAROMIC', "isDisabled" : false}];
    $scope.selectSize = function(index, listArray1) {
        var sizeIndex = $scope.tempArray.indexOf(listArray1);
        var frameImg = {};
        frameImg.frameType = $scope.listArray[sizeIndex].name;
        $scope.frameType[index] = frameImg;
        $scope.listArray[sizeIndex].isDisabled = true;
    }
});
