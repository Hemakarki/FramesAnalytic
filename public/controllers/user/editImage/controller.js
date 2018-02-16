framebridge.controller('editImageController', function($scope, $state, $stateParams, $filter, $location, $rootScope, $window, editImageServices, ModalService) {
  $scope.obj = {};
  $scope.imgVis = false;
  $scope.validImage = true;
  $scope.cropper = {};
  $scope.cropper.sourceImage = "";
  $scope.imageStored = false;
  $scope.isImageCrop = false;
  $scope.fileName = "";
  $scope.degree = 90;
  $scope.files = {};
  $scope.imageData = "";
  $scope.validImageType = false;
  $scope.showModal = false;
  $scope.details = {};
  $rootScope.isDigital = false;
  $scope.showProgressBar = false;
  $scope.disableContinue = false;
  $scope.newImage = true;

  if ($stateParams.myParam.artType == "Digital" || $stateParams.myParam == "Digital") {
    $scope.showModal = true;
    $rootScope.isDigital = true;
  } else if($stateParams.myParam.artType=="artWork"){
     $scope.showModal = true;
     $rootScope.isDigital = true;
  }else  if($stateParams.myParam.standard_resolution){
    $scope.showModal = false;
    $rootScope.isDigital = false;
  } else {
    $scope.showModal = true;
    $rootScope.isDigital = true;
  }



  $scope.instaImage = function() {
    var url = $stateParams.myParam.low_resolution.url;
    $scope.cropper.sourceImage = url;
    var image = document.getElementById('imageTest');
    image.src = $scope.cropper.sourceImage;
    var cropper = new Cropper(image, {
      movable: false,
      zoomable: false,
      autoCrop: true,
      autoCropArea: 1,
      cropable: false,
      cropBoxResizable: false,
      scalable: true,
      zoomOnTouch: false,
      ready: function() {
        setTimeout(function() {
          $scope.imageData = cropper.getCroppedCanvas().toDataURL();
          $scope.details = cropper.getImageData();
        }, 1000);
      },
      crop: function(e) {
        $scope.imageData = cropper.getCroppedCanvas().toDataURL();
        $scope.details = e.detail;
      }
    });

    $scope.setShape = function(shape) {
      if (shape == "square") {
        $scope.aspectRatio = 1;
      } else if (shape == "rectangle") {
        var aspectRatio = (image.width / image.height);
        $scope.aspectRatio = aspectRatio;
      } else {
        $scope.aspectRatio = 1;
      }
      // Destroy if already initialized
      cropper.destroy();
      $('.cropper-container').remove();
      cropper = new Cropper(image, {
        zoomable: false,
        ready: function() {
          setTimeout(function() {
            cropper.setAspectRatio($scope.aspectRatio);
            $scope.imageData = cropper.getCroppedCanvas().toDataURL('image/jpeg', 0.55);
            $scope.details = cropper.getImageData();
          }, 2000);
        },
        crop: function(e) {
          $scope.imageData = cropper.getCroppedCanvas().toDataURL('image/jpeg', 0.55);
          $scope.details = e.detail;
        }
      });
    }

    $scope.rotate = function() {
      cropper.rotate(90);
    }
  }


  if ($scope.cropper.sourceImage) {
    $scope.showHide();
  }

  $scope.cropImage = function() {
    $scope.isImageCrop = true;
  }

  $scope.myImage = '';
  $scope.myCroppedImage = '';


  $scope.showHide = function() {
    $timeout(function() {
      $scope.imgVis = true;
    }, 5000);
  }




  $scope.show = function() {
    ModalService.showModal({
      templateUrl: 'modal.html',
      controller: "editModalController",      
    }).then(function(modal) {
      modal.element.modal({
        backdrop: 'static',
        keyboard: false
      });
      $("#profile-img").change(function() {
        var filePath = $(this).val();
        readURL(this);
      });

      function readURL(input) {
        if (input.files && input.files[0]) {
          $scope.fileName = input.files[0].name;
          var reader = new FileReader();
          reader.onload = function(e) {
            $('#profile-img-tag').attr('src', e.target.result);
          }
          reader.readAsDataURL(input.files[0]);
        }
      }
      
   
      
      modal.element.modal();
      modal.close.then(function(result) {
        if (typeof(result) == "object") {
          $scope.tmppath = URL.createObjectURL(result[0]);
          $scope.cropper.sourceImage = $scope.tmppath;
          $("div").removeClass("modal-backdrop");
          $("body").removeClass("modal-open");
        } else {
          $scope.cropper.sourceImage = result;
        }
        if (result && result !== "") {
          if (result == 'Cancel') {
            $state.go('user.framesType');
          } else {
            if ($scope.cropper.sourceImage) {
              var image = document.getElementById('imageTest');
              image.src = $scope.cropper.sourceImage;
              var cropper = new Cropper(image, {
                movable: false,
                zoomable: false,
                autoCrop: true,
                autoCropArea: 1,
                cropable: false,
                cropBoxResizable: false,
                zoomOnTouch: false,
                preview: ".img-preview",
                crop: function(e) {
                  
                  $scope.imageData = cropper.getCroppedCanvas().toDataURL('image/jpeg', 0.55);
                  $scope.details = e.detail;
                }
              });
              $scope.setShape = function(shape) {
                if (shape == "square") {
                  $scope.aspectRatio = 1;
                } else if (shape == "rectangle") {
                  var aspectRatio = (image.width / image.height);
                  $scope.aspectRatio = aspectRatio;
                } else {
                  $scope.aspectRatio = 1;
                }
                // Destroy if already initialized
                cropper.destroy();
                $('.cropper-container').remove();
                cropper = new Cropper(image, {
                  zoomable: false,
                autoCropArea: 1,
                  ready: function() {
                    this.cropper.setAspectRatio($scope.aspectRatio);
                    $scope.imageData = cropper.getCroppedCanvas().toDataURL('image/jpeg', 0.55);
                    $scope.details = cropper.getImageData();
                  },
                  crop: function(e) {
                    $scope.imageData = cropper.getCroppedCanvas().toDataURL('image/jpeg', 0.55);
                    $scope.details = e.detail;
                  }
                });
              }
              $scope.rotate = function() {
                cropper.rotate(90);
              }
            }
          }
        } else {
          console.log("Error getting modal");
        }
      });
    });
  }





  $scope.addDigitalImage = function(data) {
    $scope.disableContinue = true;
    $scope.progressPercentage = 10
    $scope.width = 10;
   
    $scope.imageDetails = {};
    var timer = setInterval(function()
    {
       $scope.progressPercentage =$scope.progressPercentage + 2;
       $scope.width = $scope.width+2;
       if($scope.progressPercentage >= 90){
        clearInterval(timer);
       }
    },1500);

    if($stateParams.myParam.artType=="Digital"){
      $scope.imageDetails.artType = $stateParams.myParam.artType;
    }else{
      $scope.imageDetails.artType = "Instagram"
    }
    // $scope.obj.loading = true;
    $scope.showProgressBar = true;
    var base64 = $scope.imageData.split(",");
    var imageType = data.split(':');
    if(imageType[0]=='https'){
     $scope.imageDetails.isDigital = false;
    }else{
     $scope.imageDetails.isDigital = true;
    }

    $scope.imageDetails.digitalPhoto = {};
    $scope.imageDetails.digitalPhoto.base64 = base64[1];
    // $scope.imageDetails.digitalPhoto.base64 = newImg;
    $scope.imageDetails.digitalPhoto.filename = "digital-photo-"
    $scope.imageDetails.digitalPhoto.filetype = "image/jpeg";
    $scope.imageDetails.width = $scope.details.width; // Issue inside with height and width
    $scope.imageDetails.height = $scope.details.height; // Issue inside with height and width
    if($scope.imageDetails.artType == "Instagram") {
      editImageServices.saveDigitalImage($scope.imageDetails).then(function(response) {
        if (response.data.status == 200) {
          clearInterval(timer);
          //console.log("response here",response);
          $scope.progressPercentage = 100;
          
          $scope.width = 100;
          $scope.imageStored = true;
          $scope.validImage = true;
          $scope.obj.loading = false;
          var productArray = response.data.cartData.products;
          var length = productArray.length;
          var record = productArray[length - 1];
          if (record.isDigital == true) {
            $state.go('user.imageSize', {
              imageType: "digital"
            });
          } else {
            $state.go('user.imageSize', {
              imageType: "insta"
            });
          }
        }
        else {
          console.log("The Error response is : ", response.data);
          $scope.obj.loading = false;
        }
      });
    } else {
      var width = Math.round(($scope.imageDetails.width * 2.54) / 150);
      var height = Math.round(($scope.imageDetails.height * 2.54) / 150);
      console.log("width Height here is : ", width, height);
      if (height <= 17.8 && width <= 12.7) {
        alert("Here if");
        $scope.validImage = false;
        $scope.showProgressBar = false;
      } else {
        alert("Comes in Else");
        alert("Here else  ", $scope.imageDetails);
        editImageServices.saveDigitalImage($scope.imageDetails).then(function(response) {
          alert("M Going to herre");
          if (response.data.status == 200) {
            alert("response success");
            clearInterval(timer);
            $scope.progressPercentage = 100;
            
            $scope.width = 100;
            $scope.imageStored = true;
            $scope.validImage = true;
            $scope.obj.loading = false;
            var productArray = response.data.cartData.products;
            var length = productArray.length;
            var record = productArray[length - 1];
            if (record.isDigital == true) {
              console.log("Yesss Digital");
              $state.go('user.imageSize', {
                imageType: "digital"
              });
            } else {
              $state.go('user.imageSize', {
                imageType: "insta"
              });
            }
          }
          else {
            console.log("The Error response is : ", response.data);
            $scope.obj.loading = false;
          }
        });
      }
    }
  }




  $scope.continueAgain = function(data) {
    if(isEmpty(data)) {
      if($stateParams.myParam.standard_resolution) {
        $state.go('user.instagramPhoto');
      } else {
        $state.reload();
      }
    } else {
      var url = data.split(":")
      var protocol = url[0];
      if (protocol == "https") {
        $state.go('user.instagramPhoto');
      } 
      else {
        $state.reload();
      }
    }

    function isEmpty(obj) {
      for(var key in obj) {
          if(obj.hasOwnProperty(key))
              return false;
      }
      return true;
    }
  }
});


framebridge.controller('editModalController', function($scope, $state, $rootScope, close) {
  $scope.close = function(result) {
    close(result, 500); // close, but give 500ms for bootstrap to animate
  }
  $scope.validImageType = false;
  $scope.readFile = function(){
  }

});

framebridge.directive("fileInput", ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, ele, attrs) {
      ele.bind('change', function() {
        var type = ele[0].files[0].type;
        if (type == 'image/jpeg' || type == 'image/png' || type == 'image/gif') {
          scope.validImageType = false;
        } else {
          scope.validImageType = true;
        }
        $parse(attrs.fileInput).
        assign(scope, ele[0].files)
        scope.$apply()
        return scope.validImageType;

      });
    }
  }
}]);

framebridge.directive('fileDropzone', function() {
  return {
    restrict: 'A',
    scope: {
      file: '=',
      fileName: '='
    },
    link: function(scope, element, attrs) {
      var checkSize,
        isTypeValid,
        processDragOverOrEnter,
        validMimeTypes;


      processDragOverOrEnter = function(event) {
        if (event != null) {
          event.preventDefault();
        }
        (event.originalEvent || event).dataTransfer.effectAllowed = 'move';
        return false;
      };

      validMimeTypes = attrs.fileDropzone;

      checkSize = function(size) {
        var _ref;
        if (((_ref = attrs.maxFileSize) === (void 0) || _ref === '') || (size / 1024) / 1024 < attrs.maxFileSize) {
          return true;
        } else {
          alert("File must be smaller than " + attrs.maxFileSize + " MB");
          return false;
        }
      };

      isTypeValid = function(type) {
        if ((validMimeTypes === (void 0) || validMimeTypes === '') || validMimeTypes.indexOf(type) > -1) {
          return true;
        } else {
          alert("Invalid file type.  File must be one of following types " + validMimeTypes);
          return false;
        }
      };

      element.bind('dragover', processDragOverOrEnter);
      element.bind('dragenter', processDragOverOrEnter);

      return element.bind('drop', function(event) {
        var file, name, reader, size, type;
        if (event != null) {
          event.preventDefault();
        }
        reader = new FileReader();
        reader.onload = function(evt) {
          if (checkSize(size) && isTypeValid(type)) {
            return scope.$apply(function() {
              scope.file = evt.target.result;
              if (angular.isString(scope.fileName)) {
                return scope.fileName = name;
              }
            });
          }
        };
        event.dataTransfer = event.originalEvent.dataTransfer;
        file = event.dataTransfer.files[0];
        scope.imgVis = true;
        name = file.name;
        type = file.type;
        size = file.size;
        reader.readAsDataURL(file);
        return false;
      });
    }
  };
})
