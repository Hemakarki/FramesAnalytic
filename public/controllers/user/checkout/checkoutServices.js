framebridge.service('checkoutServices', function($http, $log, $location) {
  var service = {}
  var protocol = $location.protocol();
  var host = protocol + '://' + $location.host();
  var port = $location.port();
  var sublink = "checkout";
  var FullLink = host + ':' + port + '/' + sublink;


  service.cartValues = function() {
    return $http.get(FullLink + '/myCart');
  }

  service.payment = function(cardDetails) {
    return $http.post(FullLink + '/makePayment', cardDetails);
  }

  service.paypalPayment = function() {
    return $http.get(FullLink + '/pay');
  }

  service.updateCartUserId = function() {
    return $http.get(FullLink + '/updateCartUserId');
  }

  service.updateCartPrice = function() {
    return $http.get(FullLink + '/updateCartPrice');
  }


  service.checkOut = function(data) {
    return $http.post(FullLink + '/checkOut', data);
  }


  service.checkOutDate = function() {
    return $http.get(FullLink + '/getCheckOutDate');
  }

  
  // service.checkOutPaypal = function() {
  //   return $http.get(FullLink + '/checkOut');
  // }

  service.updateUserAddress = function(Billing) {
    return $http.post(FullLink + '/updateUser', Billing);
  }

  service.getUserAddress = function() {
      return $http.get(FullLink + '/userAddress');
  }

  service.paypalPayment = function() {
     return $http.get(FullLink + '/pay');  
  }

  return service;
});
