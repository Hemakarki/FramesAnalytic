framebridge.service('listFramesServices', function($http, $log, $location) {
	var service = {}
	var protocol = $location.protocol();
	var host = protocol + '://' + $location.host();
	var port = $location.port();
	var sublink = "admin";
	var FullLink = host + ':' + port + '/' + sublink;


  service.frameList = function(data) {
		console.log("Passing Data is  :", data);
		return $http.post(FullLink + '/listFrames', data);
	}

	service.deleteFrame = function(frameData) {
		return $http.post(FullLink + '/deleteFrame', frameData);
	}

	service.getFrameColour = function() {
			return $http.get(FullLink + '/frameColours');
	}


	service.exportProductCSV = function() {
		return $http (
			{
          url: FullLink + '/exportProducts',
          method: "GET",
          headers: {'Content-type': 'application/json'},
          responseType: 'arraybuffer'
    	}
		)
	}

		
  return service;
});
