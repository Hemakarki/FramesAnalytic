framebridge.service('paymentService', function($http, $log, $location) {
    var service = {}
    var protocol = $location.protocol();
    var host = protocol + '://' + $location.host();
    var port = $location.port();
    var sublink = "users";
    var FullLink = host + ':' + port + '/' + sublink;


    service.charge = function(credentials) {
      console.log("IN The Charge Function");
      return $http.post(FullLink + '/charge', credentials);
    }



  


    return service;

});
