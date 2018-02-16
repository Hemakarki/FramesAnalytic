framebridge.controller('editFrameController', function($scope, $state, $stateParams, $timeout, toastr, editFrameServices) {

  $scope.validImage = true;
  $scope.index;
  $scope.newIndex;
  $scope.frameType = [];
  $scope.frameImage = {};
  var framesImagesInfo;
  $scope.sizeIndex;

  $scope.getValues = function() {
    editFrameServices.getFrameColour().then(function(response) {
        if (response.data.status == 200) {
            $scope.colors = response.data.frameColours;
        } else {
            $$state.go('admin.listFrames');
        }
    });
    editFrameServices.getSizeCosts().then(function(response) {
      if (response.data.status == 200) {
          $scope.frameSizes = response.data.frameSizes;
      } else {
          $$state.go('admin.listFrames');
      }
    })
  }

  $scope.frame = {};
  $scope.frame.frameSecImg = {};
  $scope.frame.frameImage = {};
  $scope.editFrame = function() {
    $scope.edited = true;
    $scope.state = $state.current;
    $scope.params = {};
    $scope.params._id = $stateParams.foo;

    editFrameServices.getEditFrame($scope.params).then(function(response) {
      if(response.data.status == 200) {
          framesImagesInfo = response.data.frameData.frameImages;
          $scope.count = 0;
          for(var i=0 ; i<framesImagesInfo.length ; i++) {
            if(framesImagesInfo[i].isPrimary) {
              $scope.count ++; 
            }
          }
          $scope.secondry = framesImagesInfo.length - $scope.count;
          $scope.getValues();
          $scope.frame = response.data.frameData;
      }
      else {
        console.log(response.data.message);
      }
    })
  }




  $scope.saveEditFrame = function(editFrameData) {
    var frameImages = [];
    if(editFrameData.frameImage) {
        var i = 0;
        for(i = 0 ; i< editFrameData.frameImage.length ; i++) {
            var frameImg = {};
            frameImg.imgData = editFrameData.frameImage[i];
            frameImg.imageType = $scope.frameType[i].imageType;
            frameImg.isPrimary = true;
            frameImages.push(frameImg);
        }
        for(var k=0 ; k<framesImagesInfo.length ; k++) {
          var imgObj = {}
          if(framesImagesInfo[k].newImageType != undefined) {
            imgObj.imageType = framesImagesInfo[k].newImageType;  
          } else {
            imgObj.imageType = framesImagesInfo[k].imageType;  
          }
          imgObj.imgPath = framesImagesInfo[k].imgPath;
          imgObj.isPrimary = framesImagesInfo[k].isPrimary;
          imgObj._id = framesImagesInfo[k]._id;
          frameImages.push(imgObj);
        }
    }
    if(editFrameData.frameSecImg) {
        var j = 0;
        for(j = 0 ; j< editFrameData.frameSecImg.length ; j++) {
            var frameImgSec = {};
            frameImgSec.imgData = editFrameData.frameSecImg[j];
            frameImgSec.isPrimary = false;
            frameImgSec.imageType = "SECONDRY";
            frameImages.push(frameImgSec);
        }
    }
      editFrameData.frameImage = frameImages;
      editFrameServices.saveFrame(editFrameData).then(function(response) {
          if (response.data.status == 200) {
              $state.go('admin.listFrames');
          } else {
              $state.go('admin.listFrames');
          }
      });
  }



  $scope.imageValid = function() {
      var imageData = $scope.frame.frameImage;
      var frameImage = imageData;
      if(frameImage.filetype == "image/png" || "image/jpeg" || "image/jpg")
      {
        $scope.validImage = true;
      }
      else {
        $scope.validImage = false;
      }
    }



    $scope.tempArray = ['LANDSCAPE', 'PORTRAIT','SQUAR','PANAROMIC'];
    $scope.listArray = [{"name": 'LANDSCAPE', "isDisabled" : false}, {"name":'PORTRAIT', "isDisabled" : false}, {"name":'SQUAR', "isDisabled" : false}, {"name":'PANAROMIC', "isDisabled" : false}];


    $scope.editSize = function(index, listArray1) {
      $scope.sizeIndex = $scope.tempArray.indexOf(listArray1);
      framesImagesInfo[index].newImageType = $scope.listArray[$scope.sizeIndex].name;
      $scope.listArray[$scope.sizeIndex].isDisabled = true;
    }


    $scope.selectSize = function(index, listArray1) {
      $scope.sizeIndex = $scope.tempArray.indexOf(listArray1);
      var frameImg = {};
      frameImg.imageType = $scope.listArray[$scope.sizeIndex].name;
      $scope.frameType[index] = frameImg;
      $scope.listArray[$scope.sizeIndex].isDisabled = true;
    }


  $scope.removeIndex = function(imageId, frameId) {
    var data = {};
    data.imageId = imageId;
    data.frameId = frameId;
    editFrameServices.removeFrameImg(data).then(function(response) {
      if(response.data.status == 200) {
        toastr.success("Delete success");
        $state.reload();
      }
      else {
        toastr.error("Unsuccess");
        $state.reload();
      }
    });
  }



});
