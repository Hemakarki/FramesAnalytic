framebridge.controller('orderController', function($scope, $state, $filter, orderServices) {


  $scope.myOrders = function() {
    orderServices.ordersValues().then(function successCB(response) {
        $scope.orderData = response.data.orderData;
        $scope.imageType;
        for(var i=0 ; i<$scope.orderData[0].products.length ; i++) {
          var artSize = $scope.orderData[0].products[i].artData.artSizeCatagory.artSize;
          if (Math.round(artSize.height) > Math.round(artSize.width)) {
            $scope.imageType = "PORTRAIT";
          } else if (Math.round(artSize.width) > Math.round(artSize.height)) {
            $scope.imageType = "LANDSCAPE";
          } else if (Math.round(artSize.width) == Math.round(artSize.height)) {
            $scope.imageType = "SQUAR";
          } else {
            $scope.imageType = "PANAROMIC";
          }
        }
      }, function errorCB(response) {
        $scope.orderData = "";
    });
  }

});
