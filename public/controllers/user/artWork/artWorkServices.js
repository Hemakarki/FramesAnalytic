framebridge.service('artWorkServices', function($http, $log, $location) {
    var service = {}
    var protocol = $location.protocol();
    var host = protocol + '://' + $location.host();
    var port = $location.port();
    var sublink = "users";
    var FullLink = host + ':' + port + '/' + sublink;


    service.saveArtImage = function(imageData) {
        return $http.post(FullLink + '/saveArtImage', imageData);
    }

    return service;
});
