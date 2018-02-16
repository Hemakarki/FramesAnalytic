framebridge.controller('artWorkController', function($scope, $state, $stateParams, $filter, $location, $rootScope, $window, artWorkServices, ModalService) {
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
  $scope.hideOption = false;
  $scope.showProgressBar = false;
  $scope.disableContinue = false;

  $scope.cropImage = function() {
    $scope.isImageCrop = true;
  }

  $scope.myImage = '';
  $scope.myCroppedImage = '';
  $scope.params = $stateParams;
  $scope.showArtModal = function() {
    ModalService.showModal({
      templateUrl: 'modal.html',
      controller: "artModalController"
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
            $scope.BrowseCase = true;
          }
          reader.readAsDataURL(input.files[0]);
        }
      }

      modal.element.modal();
      modal.close.then(function(result) {
        if (typeof(result) == "object") {
          if (result.imgPath && typeof(result.imgPath == "string")) {
            $('.modal-open').removeClass('modal-backdrop');
            $("body").removeClass("modal-open");
            $scope.cropper.sourceImage = result.imgPath;
            $scope.cropper.imgType = result.imgType;
          } else {
            $("div").removeClass("modal-backdrop");
            $("body").removeClass("modal-open");
            $scope.tmppath = URL.createObjectURL(result[0]);
            $scope.cropper.sourceImage = $scope.tmppath;
          }
        } else {
          $scope.cropper.sourceImage = result;
        }
        if (result || result != "") {
          if (result == 'Cancel') {
            $("div").removeClass("modal-backdrop");
            $("body").removeClass("modal-open");
            $state.go('user.framesType');
          } else {
            if ($scope.cropper.sourceImage) {
              if ($scope.cropper.imgType && typeof($scope.cropper.imgType != "undefined")) {
                $scope.hideOption = true;
                var image = document.getElementById('imageTest');
                image.crossOrigin = 'Anonymous';
              } else {
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
          }
        } 
      });
    });
  }



  $scope.addDigitalImage = function(data) {
    $scope.obj.loading = true;
    $scope.disableContinue = true;
    $scope.showProgressBar = true;
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
    },2300);

    
    var base64 = $scope.imageData.split(",");
    var imageType = data.split(':');
    $scope.imageDetails.isDigital = false
    $scope.imageDetails.artWork = {};
    if(base64[1] == undefined && data) {
      $scope.imageDetails.artWork.imagePath = data;
    } else {
      $scope.imageDetails.artWork.base64 = base64[1];
    }
    $scope.imageDetails.artWork.filename = "art-work";
    $scope.imageDetails.artWork.filetype = "image/jpeg";
    $scope.imageDetails.artType = $stateParams.myParam.artType;
    $scope.imageDetails.width = $scope.details.width;
    $scope.imageDetails.height = $scope.details.height;
    var width = Math.round(($scope.imageDetails.width * 2.54) / 150);
    var height = Math.round(($scope.imageDetails.height * 2.54) / 150);

    if (width <= 1 || height <= 1) {
      $scope.validImage = false;
    } else {
      artWorkServices.saveArtImage($scope.imageDetails).then(function(response) {
        if (response.data.status == 200) {
          clearInterval(timer);
          $scope.progressPercentage = 100;
          $scope.width = 100;
          $scope.imageStored = true;
          $scope.validImage = true;
          $scope.obj.loading = false;
          var productArray = response.data.cartData.products;
          var length = productArray.length;
          var record = productArray[length - 1];
          $state.go('user.imageSize', {
            imageType: "artWork"
          })
        } else {
          console.log("The Error response is : ", response.data);
        }
      });
    }
  }



  $scope.continueAgain = function(data) {
    $state.reload();
  }
});


framebridge.controller('artModalController', function($scope, $state, $rootScope, close, $stateParams) {
  $scope.BrowseCase = false;
  $scope.close = function(result) {
    if (result != undefined && typeof(result) != undefined) {
     $('.modal-open').removeClass('modal-backdrop');
     $("body").removeClass("modal-open");
      close(result, "simple"); // close, but give 500ms for bootstrap to animate
    } else {
      $('.fade').removeClass('modal-backdrop');
      if ($stateParams.myParam.artType == "Print Poster") {
        $scope.img = {};
        $scope.img.imgPath = "images/uploads/sample_art/Poster-sample-V01.jpg";
        $scope.img.imgType = "print_poster";
        close($scope.img);
      } else if ($stateParams.myParam.artType == "Printed PHOTO") {
        $scope.img = {};
        $scope.img.imgPath = "images/uploads/sample_art/Photo-sample-V01.jpg";
        $scope.img.imgType = "printed_poster";
        close($scope.img);
      } else if ($stateParams.myParam.artType == "Certificate") {
        $scope.img = {};
        $scope.img.imgPath = "images/uploads/sample_art/Certificate-sample-V01.jpg";
        $scope.img.imgType = "certificate";
        close($scope.img);
      } else if ($stateParams.myParam.artType == "Original Art") {
        $scope.img = {};
        $scope.img.imgPath = "images/uploads/sample_art/Original-art-sample-V01.jpg";
        $scope.img.imgType = "original_art";
        close($scope.img);
      } else {
        $scope.img = {};
        $scope.img.imgPath = "images/uploads/sample_art/Art-on-canvas-sample-V01.jpg";
        $scope.img.imgType = "canvas";
        close($scope.img);
      }
    }
  }
  $scope.validImageType = false;
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