framebridge.service('addFramesServices', function($http, $log, $location) {
    var service = {}
    var protocol = $location.protocol();
    var host = protocol + '://' + $location.host();
    var port = $location.port();
    var sublink = "admin";
    var FullLink = host + ':' + port + '/' + sublink;


    service.addFrames = function(framesData) {
        return $http.post(FullLink + '/addFrames', framesData);
    }

    service.addColour = function(newColour) {
        return $http.post(FullLink + '/addColour', newColour);
    }

    service.deleteSelectedColor = function(color) {
      return $http.post(FullLink + '/deleteColor', color); 
    }

    service.getFrameColour = function() {
        return $http.get(FullLink + '/frameColours');
    }

    service.getSizeCosts = function() {
      return $http.get(FullLink + '/artSizeCosts');
    }

    return service;
});
