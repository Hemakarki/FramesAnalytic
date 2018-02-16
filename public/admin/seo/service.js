framebridge.service('seoService', function($http, $log, $location) {
	var service = {}
	var protocol = $location.protocol();
	var host = protocol + '://' + $location.host();
	var port = $location.port();
	var sublink = "admin";
	var FullLink = host + ':' + port + '/' + sublink;

	service.addSEO = function(payload) {
		return $http.post(FullLink + '/addSEO', payload);
	}


	service.updateSEO = function(payload) {
		return $http.post(FullLink + '/updateSEO', payload);
	}

	service.listSEO = function() {
		return $http.get(FullLink + '/listSEO');
	}

	service.getSEOValue = function(data) {
		return $http.post(FullLink + '/getSEOValue', data);
	}

	service.updateSEO = function(data) {
		return $http.post(FullLink + '/updateSEO', data);
	}



	return service;
})