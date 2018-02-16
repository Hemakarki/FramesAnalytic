framebridge.service('shippingServices', function($http, $log, $location) {
    var service = {}
    var protocol = $location.protocol();
    var host = protocol + '://' + $location.host();
    var port = $location.port();
    var sublink = "users";
    var FullLink = host + ':' + port + '/' + sublink;



    service.saveAddress = function(addresses) {
        return $http.post(FullLink + '/saveAddress', addresses);
    }


    service.saveShippingAddress = function(data, id) {

        var address = {};
        if (data.address.formatted) {
            address.address = data.address.formatted;
        } else {
            address.address = data.address;
        }
        address.city = data.city,
            address.state = data.state,
            address.firstName = data.firstName,
            address.lastName = data.lastName,
            address.zipCode = data.zipCode,
            address.phone = data.phone,
            address._id = data._id;
        return $http.post(FullLink + '/saveShippingAddress/' + id, address);
    }

    service.savePackingAddress = function(data, id) {
        var address = {};
        if (data.address.formatted) {
            address.address = data.address.formatted;
        } else {
            address.address = data.address;
        }
        address.city = data.city,
            address.state = data.state,
            address.firstName = data.firstName,
            address.lastName = data.lastName,
            address.zipCode = data.zipCode,
            address.phone = data.phone,
            address._id = data._id;
        return $http.post(FullLink + '/savePackingAddress/' + id, address);
    }

    service.saveBillingAddress = function(data, id) {
      console.log("here is your data",data)
        var address = {};
        if (data.address.formatted) {
            address.address = data.address.formatted;
        } else {
            address.address = data.address;
        }
        address.city = data.city,
            address.state = data.state,
            address.firstName = data.firstName,
            address.lastName = data.lastName,
            address.zipCode = data.zipCode,
            address.phone = data.phone,
            address._id = data._id;
        return $http.post(FullLink + '/saveBillingAddress/' + id, address);
    }

    service.getUserAddress = function() {
        return $http.get(FullLink + '/userAddress');
    }


    return service;
});
