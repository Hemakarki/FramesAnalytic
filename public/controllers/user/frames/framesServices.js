framebridge.service('framesServices', function($http, $log, $location) {
	var service = {}
	var protocol = $location.protocol();
	var host = protocol + '://' + $location.host();
	var port = $location.port();
	var sublink = "users";
	var FullLink = host + ':' + port + '/' + sublink;


  service.frames = function(data) {
		console.log("Passing Data is  :", data);
		return $http.post(FullLink + '/framesList', data);
	}

	service.getFrameColour = function() {
			return $http.get(FullLink + '/frameColours');
	}

	service.cartImage = function() {
		return $http.get(FullLink + '/getCart');
	}

	service.getImageSize = function(data) {
		return $http.post(FullLink + '/getImageSizeCost', data);
	}

  return service;
});
