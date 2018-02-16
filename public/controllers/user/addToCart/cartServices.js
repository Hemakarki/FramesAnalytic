framebridge.service('cartServices', function($http, $log, $location) {
    var service = {}
    var protocol = $location.protocol();
    var host = protocol + '://' + $location.host();
    var port = $location.port();
    var sublink = "users";
    var FullLink = host + ':' + port + '/' + sublink;


    service.cartValues = function() {
        return $http.get(FullLink + '/myCart');
    }


    service.deleteProduct = function(data) {
      return $http.post(FullLink + '/deleteProduct', data);
    }

    service.checkLogin = function() {
      return $http.get(FullLink + '/checkLogin');
  }

    service.makeDuplicateProduct = function(data) {
      return $http.post(FullLink + '/makeDuplicateProduct', data);
    }


    service.productInstruction = function(data) {
      return $http.post(FullLink + '/addInstruction', data);
    }

    service.getFrameSize = function(data) {
      return $http.post(FullLink + '/getFrameSize', data);
    }

    service.updateQuantity = function(data) {
      return $http.post(FullLink + '/updateProductQuantity', data);
    }

    service.updateCartPrice = function() {
      return $http.get(FullLink + '/updateCartPrice');
    }

    service.checkOutDate = function() {
      return $http.get(FullLink + '/getCheckOutDate');
    }

    service.addGiftMessage = function(data) {
      return $http.post(FullLink + '/cartGiftMessage', data);
    }

    service.applyPromoCode = function(data) {
      return $http.post(FullLink + '/applyPromoCode', data);
    }

    service.updateMailinType = function(data){
       return $http.post(FullLink+'/updateMailinType',data)
    }

    return service;
});
