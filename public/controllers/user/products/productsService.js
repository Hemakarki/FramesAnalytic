framebridge.service('productsServices', function($http, $log, $location) {
    var service = {}
    var protocol = $location.protocol();
    var host = protocol + '://' + $location.host();
    var port = $location.port();
    var sublink = "users";
    var FullLink = host + ':' + port + '/' + sublink;
  
  
    service.getFrames = function(data) {
		return $http.post(FullLink + '/framesList', data);
	}

	service.getFrameColour = function() {
		return $http.get(FullLink + '/frameColours');
	}
    
    return service;
  });
  