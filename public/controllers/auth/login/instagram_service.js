angular.module('framebridge').factory("instagramService", function ($rootScope, $location, $http) {
    var client_id = "2f4a3c2d0d4d4166be80911dc42d2a62";

    var service = {
        _access_token: null,
        access_token: function(newToken) {
            if(angular.isDefined(newToken)) {
                this._access_token = newToken;
            }
            return this._access_token;
        },
        instagramAuthentication: function () {
            var igPopup = window.open("https://instagram.com/oauth/authorize/?client_id=" + client_id +
                "&redirect_uri=" + $location.absUrl().split('#')[0] +
                "&response_type=token", "igPopup");
            

			//console.log(array);
           // console.log('======================'+igPopup);
        }
    };

    $rootScope.$on("igAccessTokenObtained", function (evt, args) {
        service.access_token(args.access_token);
    });

    return service;

});