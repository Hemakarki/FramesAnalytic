framebridge.controller("productsController", function($scope, $state, toastr, productsServices) {
  $scope.obj = {};



  $scope.frameColor = function() {
    $scope.obj.loading = true;
    productsServices.getFrameColour().then(function success(response) {
        $scope.obj.loading = false;
        $scope.colors = response.data.frameColours;
    }, function error(response) {
        $scope.obj.loading = false;
    });
  }



  $scope.getFrames = function(searchValue) {
    $scope.obj.loading = true;
    var data = {};
    data.searchColor = searchValue;
    productsServices.getFrames(data).then(
      function success(response) {
        $scope.frames = response.data.frameData;
        $scope.obj.loading = false;
        $scope.productImg = "/images/portrait.jpg";
      },
      function error(response) {
        $scope.obj.loading = false;
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
          if (artSize == 'XL') {
            imgX = imgY = 10;
            imgXm = imgYm = 20;
          } else if(artSize == 'L') {
            imgX = 25; imgY = 25;
            imgXm = 50; imgYm = 50;
          } else if(artSize == 'M') {
            imgX = 35; imgY = 35;
            imgXm = 70; imgYm = 70;
          } else if(artSize == 'S') {
            imgX = 40; imgY = 45;
            imgXm = 80; imgYm = 90;
          } else {
            imgX = 60; imgY = 55;
            imgXm = 120; imgYm = 110;
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
