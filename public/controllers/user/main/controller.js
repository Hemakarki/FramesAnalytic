framebridge.controller('mainController', function($scope, $http, $state, $filter, mainService,$location) {

  $scope.loggedIn = false;
  $scope.cartItems;
  $scope.compare;

  $scope.getMetaTags = function() {
    mainService.getMetaTags().then(function(response) {
        $scope.keyword = response.data.keyword;
        $scope.description = response.data.description;
       
    }, function(error) {
        
    })
  }
  $scope.getMetaTags();

  $scope.checkCartItem = function() {
    mainService.cartItems().then(function(response) {
      if (response.data.status == 200) {
        if(response.data.cartData) {
          var length = response.data.cartData.products.length;
          $scope.cartItems = length;  
        }
      } else {
        $scope.cartItems = 0
      }
    });
  }

  

  $scope.getLogout = function() {
    mainService.logout().then(function successCB(resp) {
      $scope.loggedIn = false;
      $scope.checkCartItem();
      $state.go('/');
    }, function errorCB(resp) {
      console.log("The Error Response in Logout is : ");
    });
  }



  $scope.checkSession = function() {
    mainService.checkloggedIn().then(function(response) {
      if (response.data.status == 200) {
        $scope.loggedIn = true;
        $scope.checkCartItem();
      } else {
        $scope.loggedIn = false;
      }
    });
  }


  $scope.getCompare = function() {
    mainService.getCompareList().then(function success(response) {
      $scope.compare = response.data.compareData.length;
    }, function error(response) {
      console.log("Function response in error is : ", response);
    });
  }



  $scope.checkCartItem();
  $scope.checkSession();
  $scope.getCompare();

  $scope.$on('loginSession', function(event, data) {
    $scope.loggedIn = data;
  });


  $scope.$on('cartVal', function(event, data) {
    $scope.cartItems = data;
  });

  $scope.$on('compareVal', function(event, data) {
    $scope.compare = data;
  });


});