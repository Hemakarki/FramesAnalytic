framebridge.service('compareServices', function($http, $log, $location) {
    var service = {}
    var protocol = $location.protocol();
    var host = protocol + '://' + $location.host();
    var port = $location.port();
    var sublink = "users";
    var FullLink = host + ':' + port + '/' + sublink;
  
  
    service.getCompareProducts = function() {
      return $http.get(FullLink + '/getCompareProducts');
    }
    
    service.getSizeCosts = function() {
      return $http.get(FullLink + '/getSizeCosts');
    }

    service.resetCompareCart = function() {
      return $http.get(FullLink + '/resetCompareCart');
    }

    service.removeProduct = function(data) {
      return $http.post(FullLink + '/removeCompare', data);
    }

    service.addToCartProduct = function(data) {
      return $http.post(FullLink + '/addToCartProduct', data);
    }

    service.updateCartPrice = function(data) {
      return $http.get(FullLink + '/updateCartPrice');
    }
    
    return service;
  });
  