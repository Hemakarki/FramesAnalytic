framebridge.service('PageService', function($http, $log, $location) {
	var service = {}
	var protocol = $location.protocol();
	var host = protocol + '://' + $location.host();
	var port = $location.port();
	var sublink = "pages";
	var FullLink = host + ':' + port + '/' + sublink;

	service.getstartFramingContent = function(data){
		return $http.post(FullLink + '/getstartFramingContent',data);
	}
	return service;

})