framebridge.service('mainService', function($http, $log, $location) {
  var service = {}
  var protocol = $location.protocol();
  var host = protocol + '://' + $location.host();
  var port = $location.port();
  var sublink = "users";
  var FullLink = host + ':' + port + '/' + sublink;


  service.checkloggedIn = function() {
    return $http.get(FullLink + '/checkSession');
  }

  service.logout = function() {
    return $http.get(FullLink + '/logout');
  }


  service.cartItems = function() {
    return $http.get(FullLink + '/myCart');
  }

  service.getMetaTags = function() {
    return $http.get(FullLink + '/getMetaTags');
  }

  service.getCompareList = function() {
    return $http.get(FullLink + '/getCompareProducts');
  }
  return service;
});