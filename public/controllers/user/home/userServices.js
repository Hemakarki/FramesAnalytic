framebridge.service('userService', function($http, $log, $location) {
    var service = {}
    var protocol = $location.protocol();
    var host = protocol + '://' + $location.host();
    var port = $location.port();
    var sublink = "users";
    var FullLink = host + ':' + port + '/' + sublink;

    var fullLink = host + ':' + port + '/' + 'authentication';


    service.tempCart = function(data) {
        return $http.post(FullLink + '/tempCart', data);
    }


    service.checkloggedIn = function() {
      return$http.get(FullLink + '/checkSession');
    }

    service.getInspirationalImages = function(){
        return $http.get(FullLink+'/getInspirationalImages');
    }

    service.getUserInfo = function() {
        return $http.get(FullLink + '/getUserDetails');
    }

    service.updateBilling = function(data) {
        return $http.post(fullLink + '/updateBilling', data);
    }


    service.updateShipping = function(data) {
        return $http.post(fullLink + '/updateShipping', data);
    }


    service.updatePersonal = function(data) {
        return $http.post(fullLink + '/updatePersonal', data);
    }


    return service;
});
