(function () {

  angular
  .module('framebridge')
  .controller('loginCtrl', loginCtrl);

  loginCtrl.$inject = ['$location', '$window', '$scope', '$state', '$http', 'authentication', 'toastr'];
  function loginCtrl($location, $window, $scope, $state, $http, authentication, toastr) {
    var vm = this;

    vm.credentials = {
      username : "",
      password : "",
      userType: ""
    };

    $scope.signin = function (data) {
      vm.credentials.userType = 'user';
      authentication
        .login(data)
        .error(function(err){
          vm.credentials = {
            username : "",
            password : "",
            userType: ""
          };
        toastr.error("Either username or password is incorrect");
        })
        .then(function(response){
          vm.credentials = {
            username : "",
            password : "",
            userType: ""
          };
          $scope.loggedIn = true;
          toastr.success("User successfully login");
            $scope.$emit('loginSession', $scope.loggedIn);
            // $state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
            // $state.reload();
            $state.reload($state.current.name);
        });
    };

    vm.onSubmit = function () {
      vm.credentials.userType = 'admin';
      authentication
        .loginAdmin(vm.credentials)
        .error(function(err){
          vm.credentials = {
            username : "",
            password : "",
            userType: ""
          };
          toastr.error("Either username or password is incorrect");
        })
        .then(function(){
          vm.credentials = {
            username : "",
            password : "",
            userType: ""
          };
          toastr.success("User successfully login");
          $location.path('/dashboard');
        });
    };

    vm.onLogout = function (req, res) {alert('=====')
      $window.localStorage.removeItem('mean-token');
      req.session.destroy();
    };

  }

})();