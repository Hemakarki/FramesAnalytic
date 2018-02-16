framebridge.service('sizecostService', function($http, $log, $location) {
	var service = {}
	var protocol = $location.protocol();
	var host = protocol + '://' + $location.host();
	var port = $location.port();
	var sublink = "admin";
	var FullLink = host + ':' + port + '/' + sublink;

	service.getSizeCost = function() {
		return $http.get(FullLink + '/getSizeCost');
	}

    service.updateSizeCost = function(data) {
        return $http.post(FullLink + '/updateSize', data);
    }

	return service;
})