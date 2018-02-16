framebridge.controller('shippingController', function($scope, $state, $stateParams, $filter, $rootScope, shippingServices) {


  $scope.sameAs = false;
  $scope.Billing = {};
  $scope.Shipping = {};

  $scope.showaddressss = function() {
    if ($rootScope.users.billingAddress != "" && $rootScope.users.shippingAddress != "") {
      $scope.Billing = $rootScope.users.billingAddress;
      $scope.Shipping = $rootScope.users.shippingAddress;
    } else {
      $scope.Billing = "";
      $scope.Shipping = "";
      $state.go($state.current, {}, {
        reload: true
      });
    }
  }


  $scope.sameAddress = function(value) {
    if(value) {
      $scope.Shipping = $scope.Billing;
    }
    else {
      $scope.Shipping = {};
    }

  }



  $scope.updateAddress = function(Billing, Shipping) {
    var addresses = {};
    addresses.billing = Billing;
    addresses.shipping = Shipping;
    shippingServices.saveAddress(addresses).then(function successCb(response) {
      $state.go('user.payment');
    }, function errorCb(response) {
      console.log("Error Calll Back");
    });
  }



  $scope.showaddress = function() {
    shippingServices.getUserAddress().then(function successCb(response) {
      $scope.userData = response.data.userData;

      if ($scope.userData.billingAddress != "" && $scope.userData.shippingAddress != "") {
        $scope.Billing = $scope.userData.billingAddress;
        $scope.Shipping = $scope.userData.shippingAddress;
      } else {
        $scope.Billing = "";
        $scope.Shipping = "";
      }
    }, function errorCb(response) {
      console.log("Error in Addressess");
    });
  }


  $scope.submit = function() {
    shippingServices.saveShippingAddress($scope.Shipping, $stateParams.id).then(function(response) {});
    shippingServices.saveBillingAddress($scope.Billing, $stateParams.id).then(function(response) {});
    shippingServices.savePackingAddress($scope.Packing, $stateParams.id).then(function(response) {});

  };



});
