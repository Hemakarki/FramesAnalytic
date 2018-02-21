framebridge.service('instagramService', function($http, $log, $location) {
    var service = {}
    var protocol = $location.protocol();
    var host = protocol + '://' + $location.host();
    var port = $location.port();
    var sublink = "users";
    var FullLink = host + ':' + port + '/' + sublink;

    service.getToken = function() {
		return $http.get(FullLink + '/auth/instagram');
	}

    return service;
});
