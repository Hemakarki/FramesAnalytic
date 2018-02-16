framebridge.service('paymentReportService', function($http, $log, $location) {
	var service = {}
	var protocol = $location.protocol();
	var host = protocol + '://' + $location.host();
	var port = $location.port();
	var sublink = "admin";
	var FullLink = host + ':' + port + '/' + sublink;

	

    service.getPaymentReport = function(data) {
		return $http.post(FullLink + '/getPaymentReport', data);
	}

	return service;
});