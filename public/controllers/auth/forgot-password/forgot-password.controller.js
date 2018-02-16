(function () {

  angular
  .module('framebridge')
  .controller('forgotPasswordCtrl', forgotPasswordCtrl);
  forgotPasswordCtrl.$inject = ['$location','$scope', 'toastr', 'authentication'];
  function forgotPasswordCtrl($location,$scope, toastr, authentication) {
    var vm = this;
    $scope.obj = {};
    vm.credentials = {
      email : ""
    };

    $scope.forgotPassword = function(vm) {
      $scope.obj.loading = true;
      authentication
        .forgotPassword(vm.credentials)
        .error(function(err){
          $scope.obj.loading = false;
          toastr.error("Can't reset email");
        })
        .then(function(){
          $scope.obj.loading = false;
          toastr.success("New password sent to email successfully");
        });
    };

  }

})();