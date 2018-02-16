framebridge.service('orderServices', function($http, $log, $location) {
	var service = {}
	var protocol = $location.protocol();
	var host = protocol + '://' + $location.host();
	var port = $location.port();
	var sublink = "admin";
	var FullLink = host + ':' + port + '/' + sublink;


  service.getOrderInfo = function(data) {
		return $http.post(FullLink + '/ordersInfo', data);
	}


	return service;
});
