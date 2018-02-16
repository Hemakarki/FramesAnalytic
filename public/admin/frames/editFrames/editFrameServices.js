framebridge.service('editFrameServices', function($http, $log, $location) {
	var service = {}
	var protocol = $location.protocol();
	var host = protocol + '://' + $location.host();
	var port = $location.port();
	var sublink = "admin";
	var FullLink = host + ':' + port + '/' + sublink;


  service.getEditFrame = function(framesData) {
		return $http.post(FullLink + '/editFrame', framesData);
	}


	service.getFrameColour = function() {
		return $http.get(FullLink + '/frameColours');
	}

	service.getSizeCosts = function() {
		return $http.get(FullLink + '/artSizeCosts');
	}

  service.saveFrame = function(framesData) {
    return $http.post(FullLink + '/saveFrame', framesData);
	}
	
	service.removeFrameImg = function(data) {
		return $http.post(FullLink + '/removeFrameImg', data);
	}

  return service;
});
