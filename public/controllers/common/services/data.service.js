(function() {

  angular
    .module('framebridge')
    .service('meanData', meanData);

  meanData.$inject = ['$http', '$location', 'authentication'];
  function meanData ($http, $location, authentication) {

  var service = {}
  var protocol = $location.protocol();
  var host = protocol + '://' + $location.host();
  var port = $location.port();
  var sublink = "users";
  var FullLink = host + ':' + port + '/' + sublink;


  var getProfile = function () {
      return $http.get(FullLink + '/profile', {
        headers: {
          Authorization: 'Bearer '+ authentication.getToken()
        }
      });
    };

    return {
      getProfile : getProfile
    };
  }

})();
