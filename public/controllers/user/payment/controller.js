framebridge.controller('paymentController', function($scope, $state, paymentService) {

  $scope.paymentSuccess = false;

  $scope.obj = {};
  $scope.payNow = function(credentials) {
    $scope.obj.loading = true;
    paymentService.charge(credentials).then(function successResp(response) {
        if(response.data.status = 'succeeded') {
          $scope.obj.loading = false;
          $scope.checkOut();
          $scope.paymentSuccess = true;
          $state.go('user.thanks');
        }

    }, function errorResp(response) {

      console.log("The Error response is :");

    });
  }




  $scope.checkOut = function() {
    paymentService.checkOut().then(function(response) {
      if(response.data.status == 200) {
        $scope.clearCookie();
      }
      else {
        console.log("No Response");
      }
    });
  }




  $scope.clearCookie = function(name) {
    document.cookie = "qwertyuiop=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }



});
