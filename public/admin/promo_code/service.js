framebridge.service('promoService', function($http, $log, $location) {
	var service = {}
	var protocol = $location.protocol();
	var host = protocol + '://' + $location.host();
	var port = $location.port();
	var sublink = "admin";
	var FullLink = host + ':' + port + '/' + sublink;

	service.addPromoCode = function(payload) {
		return $http.post(FullLink + '/addPromoCode', payload);
	}

	service.getPromoList = function(payload){
        return $http.post(FullLink+'/getPromoList',payload);
	}
    
    service.deletePromoCode = function(payload){
       return $http.post(FullLink+'/deletePromoCode',payload);
    }

    service.getPromoCodeDetails = function(payload){
    	return $http.post(FullLink+'/getPromoCodeDetails',payload);
    }

    service.updatePromoCode = function(payload){
    	return $http.post(FullLink+'/updatePromoCode',payload);
    }

	return service;
});