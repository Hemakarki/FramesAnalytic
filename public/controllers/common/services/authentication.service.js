(function () {

  angular
    .module('framebridge')
    .service('authentication', authentication);

  authentication.$inject = ['$http', '$window', '$location'];
  function authentication ($http, $window, $location) {

    var service = {}
    var protocol = $location.protocol();
    var host = protocol + '://' + $location.host();
    var port = $location.port();
    var sublink = "authentication";
    var FullLink = host + ':' + port + '/' + sublink;



    var saveToken = function (token) {
      $window.localStorage['mean-token'] = token;
    };

    var getToken = function () {
      return $window.localStorage['mean-token'];
    };

    var isLoggedIn = function() {
      var token = getToken();
      var payload;

      if(token){
        payload = token.split('.')[1];
        payload = $window.atob(payload);
        payload = JSON.parse(payload);

        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    };

    var currentUser = function() {
      if(isLoggedIn()){
        var token = getToken();
        var payload = token.split('.')[1];
        payload = $window.atob(payload);
        payload = JSON.parse(payload);
        return {
          email : payload.email,
          name : payload.name
        };
      }
    };

    var register = function(user) {
      return $http.post(FullLink + '/register', user).success(function(data) {
        saveToken(data.token);
      });
    };

    var guestRegister = function(data) {
      return $http.post(FullLink + '/guestUser', data).success(function(respdata) {
        saveToken(respdata.token);
      });
    };

    var login = function(user) {
      return $http.post(FullLink + '/login', user).success(function(data) {
        saveToken(data.token);
      });
    };

    var loginAdmin = function(user) {
      return $http.post(FullLink + '/loginAdmin', user).success(function(data) {
        saveToken(data.token);
      });
    };

    var logout = function() {
      $window.localStorage.removeItem('mean-token');
      req.session.destroy();
    };

    var forgotPassword = function(user) {
       return $http.post(FullLink+'/forgotPassword', user);
    }

    return {
      currentUser : currentUser,
      saveToken : saveToken,
      getToken : getToken,
      isLoggedIn : isLoggedIn,
      register : register,
      guestRegister : guestRegister,
      login : login,
      loginAdmin:loginAdmin,
      logout : logout,
      forgotPassword: forgotPassword
    };
  }


})();
