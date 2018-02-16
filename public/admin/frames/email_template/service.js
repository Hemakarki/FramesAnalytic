framebridge.service('emailService', function($http, $log, $location) {
	var service = {}
	var protocol = $location.protocol();
	var host = protocol + '://' + $location.host();
	var port = $location.port();
	var sublink = "admin";
	var FullLink = host + ':' + port + '/' + sublink;

	service.listTemplate = function(data) {
                        //\\console.log("in service");
        return $http.post(FullLink + '/listTemplate', data);
	}

	service.submitEmailTemplate = function(data) {
		return $http.post(FullLink + '/addTemplate', data);
	}
	
	service.updateTemplate = function(data) {
		return $http.post(FullLink + '/editTemplate', data);
	}
	

	service.getTemplate = function(data) {
		return $http.post(FullLink + '/getTemplate', data);
	}

	return service;
});