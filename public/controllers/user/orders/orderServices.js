framebridge.service('orderServices', function($http, $log, $location) {
  var service = {}
	var protocol = $location.protocol();
	var host = protocol + '://' + $location.host();
	var port = $location.port();
	var sublink = "users";
	var FullLink = host + ':' + port + '/' + sublink;


  service.ordersValues = function() {
		return $http.get(FullLink + '/myOrders');
	}

  return service;

});
