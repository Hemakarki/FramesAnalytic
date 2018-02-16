framebridge.controller('orderController', function($scope, $http, toastr, $rootScope, $state, $stateParams, orderServices, $localStorage, ngTableParams) {
    $scope.myobj = {};

    $scope.ordersInfo = function(search) {
      var passingData = {};
      if (search) {
          passingData.search = $scope.searchPage;
      } else {
          passingData.search = '';
      }
      passingData.orderId = $stateParams.orderId;
      orderServices.getOrderInfo(passingData).then(function successResp(response) {
        $scope.orderInfo = response.data.data;
        $scope.products = $scope.orderInfo[0].products;
      }, function errorResp(response) {
        console.log("Error in Orders Information", response);
      });
    }



  });
