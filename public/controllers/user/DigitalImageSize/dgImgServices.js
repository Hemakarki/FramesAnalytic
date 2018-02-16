framebridge.service('dgImgServices', function($http, $log, $location) {
    var service = {}
    var protocol = $location.protocol();
    var host = protocol + '://' + $location.host();
    var port = $location.port();
    var sublink = "users";
    var FullLink = host + ':' + port + '/' + sublink;


    service.getCart = function() {
        return $http.get(FullLink + '/getCart');
    }

    service.newUpdateArt = function(artData) {
      return $http.post(FullLink + '/updateArt', artData);
    }

    service.getSizeCosts = function() {
      return $http.get(FullLink + '/getSizeCosts');
    }

    service.saveArtSizes = function(artData) {
      return $http.post(FullLink + '/newArt', artData);
    }

    return service;
});
