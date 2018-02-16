framebridge.service('detailFramesServices', function($http, $log, $location) {
	var service = {}
	var protocol = $location.protocol();
	var host = protocol + '://' + $location.host();
	var port = $location.port();
	var sublink = "admin";
	var FullLink = host + ':' + port + '/' + sublink;


  service.detailFrames = function(frameData) {
		return $http.post(FullLink + '/frameDeatils', frameData);
	}


  return service;
});
