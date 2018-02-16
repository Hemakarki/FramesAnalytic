framebridge.service('framePreviewService', function($http, $log, $location) {
    var service = {}
    var protocol = $location.protocol();
    var host = protocol + '://' + $location.host();
    var port = $location.port();
    var sublink = "users";
    var FullLink = host + ':' + port + '/' + sublink;


    service.getFrame = function(data) {
        return $http.post(FullLink + '/getFrame', data);
    }

    service.getSizeCosts = function() {
      return $http.get(FullLink + '/getSizeCosts');
    }


    service.getMat = function() {
      return $http.get(FullLink + '/listMat');
    }

    service.artSizes = function() {
      return $http.get(FullLink + '/artSizes');
    }

    service.addCart = function(cartData) {
      console.log("add tom cart data is : ", cartData);
      return $http.post(FullLink + '/addToCart', cartData);
    }

    service.getFrameSize = function(data) {
      return $http.post(FullLink + '/getFrameSize', data);
    }

    service.matDetails = function(data) {
      return $http.post(FullLink + '/matDetails', data);
    }


    service.updateCartPrice = function(data) {
      return $http.get(FullLink + '/updateCartPrice');
    }

    service.addToCompare = function(data) {
      return $http.post(FullLink + '/addToComapre', data);
    }


    return service;
});
