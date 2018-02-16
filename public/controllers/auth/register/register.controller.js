(function () {

  angular
    .module('framebridge')
    .directive('pwCheck', [function () {
      return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
          var firstPassword = '#' + attrs.pwCheck;
          $(elem).add(firstPassword).on('keyup', function () {
            scope.$apply(function () {
              var v = elem.val()===$(firstPassword).val();
              ctrl.$setValidity('pwmatch', v);
            });
          });
        }
      }
    }])

    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$scope', '$location', '$state', 'authentication', 'toastr'];
  function registerCtrl($scope, $location, $state, authentication, toastr) {
    $scope.credentials = {
      firstName : "",
      lastName : "",
      email : "",
      password : ""
    };

    $scope.register = function(credentials) {
      if(credentials.email != ""){
        authentication
          .register(credentials)
          .error(function(err){
          if(err.status == 422)
          {
            alert("inj Error");
            toastr.error(err.message);
            $scope.credentials = {
              firstName : "",
              lastName : "",
              email : "",
              password : ""
            };
          }
        })
        .then(function(){
          toastr.success("User successfully register");
          $scope.credentials = {};
          $state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
        }); 
      } else {
        toastr.error("Please fill your details carefully");
      }
    }

  }

})();
