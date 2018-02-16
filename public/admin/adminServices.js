framebridge.service('adminServices', function($http, $log, $location) {
	var service = {}
	var protocol = $location.protocol();
	var host = protocol + '://' + $location.host();
	var port = $location.port();
	var sublink = "admin";
	var FullLink = host + ':' + port + '/' + sublink;

	service.signIn = function(loginData) {
		return $http.post(FullLink + '/authenticate', loginData);
	}
	service.getallUsers = function(data) {
		return $http.post(FullLink + '/getallUsers', data);
	}

	service.getallOrders = function(data) {
		return $http.post(FullLink + '/getallOrders', data);
	}

	service.getallUserOrders = function(data) {
		return $http.post(FullLink + '/getallOrders', data);
	}

	service.getOrderDetail = function(data) {
		return $http.get(FullLink + '/getOrderDetail/' + data);
	}

	service.getUserOrderDetail = function(data) {
		return $http.get(FullLink + '/getUserOrderDetail/' + data);
	}

	service.getUserDetail = function(data) {
		return $http.get(FullLink + '/getUserDetail/' + data);
	}

	service.deleteuser = function(data) {
		return $http.put(FullLink + '/deleteuser/' + data);
	}

	service.undeleteuser = function(data) {
		return $http.put(FullLink + '/undeleteuser/' + data);
	}

	service.submitTemplate = function(data) {
		return $http.post(FullLink + '/submitTemplate', data)
	}

	service.getAllPages = function(data) {
		return $http.post(FullLink + '/getAllPages', data)
	}


	service.getPageData = function(data) {
		return $http.post(FullLink + '/getPageData', data)
	}

	service.deletePageData = function(data) {
		return $http.post(FullLink + '/deletePageData', data)
	}

	service.updateTemplate = function(data) {
		return $http.post(FullLink + '/updateTemplate', data)
	}

	service.saveOrderStatus = function(data) {
		return $http.post(FullLink + '/saveOrderStatus', data)
	}

	service.submitInspirationData = function(data) {
		return $http.post(FullLink + '/submitInspirationData', data)
	}

	service.listInspirational = function(data) {
		return $http.post(FullLink + '/listInspirational', data);
	}

	service.deleteInspirationalData = function(data) {
		return $http.post(FullLink + '/deleteInspirationalData', data);
	}

	service.getInspirationalData = function(data) {
		return $http.post(FullLink + '/getInspirationalData', data);
	}

	service.updateInspirationData = function(data) {
		return $http.post(FullLink + '/updateInspirationData', data);
	}
	
	service.getDetails = function(data) {
		return $http.post(FullLink + '/getDetails', data);
	}

	service.updateUserDetails = function(data) {
		return $http.post(FullLink + '/updateUserDetails', data);
	}

	service.addETA = function(data) {
		return $http.post(FullLink + '/addETA', data);
	}
    service.getCheckoutDetails = function() {
		return $http.get(FullLink + '/getCheckoutDetails');
	}
	service.updateETA = function(data) {
		return $http.post(FullLink + '/updateETA',data);
	}

	service.addDelivery = function(data) {
		return $http.post(FullLink + '/addDelivery', data);
	}
    service.getDeliveryDetails = function() {
		return $http.get(FullLink + '/getDeliveryDetails');
	}
	service.updateDelivery = function(data) {
		return $http.post(FullLink + '/updateDelivery',data);
	}
	


	service.exportOrderCSV = function() {
		return $http (
			{
          url: FullLink + '/exportOrders',
          method: "GET",
          headers: {'Content-type': 'application/json'},
          responseType: 'arraybuffer'
    	}
		)
	}



	service.exportUserCSV = function() {
		return $http (
			{
          url: FullLink + '/exportUsers',
          method: "GET",
          headers: {'Content-type': 'application/json'},
          responseType: 'arraybuffer'
    	}
		)
	}




	return service;
});
