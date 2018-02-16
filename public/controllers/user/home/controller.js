framebridge.controller('userController', function($scope, $state, toastr, uuid, userService, $timeout) {



  $scope.obj = {};
  $scope.obj.personalField = true;
  $scope.obj.billingField = true;
  $scope.obj.shippingField = true;

  $scope.userData = {};

  $scope.checkCookie = function() {
    var user = $scope.getCookie("qwertyuiop");
    if (user && user != "") {
      // $scope.createOrder(user);
      $state.go('user.framesType');
    } else {
      user = uuid.v4();
      $scope.setCookie("qwertyuiop", user, 30);
      var user = $scope.getCookie("qwertyuiop");
      $scope.createCart(user);
    }
  }

  $scope.slickConfig = {
    enabled: true,
    draggable: false,
    method: {},
    event: {
        beforeChange: function (event, slick, currentSlide, nextSlide) {
        },
        afterChange: function (event, slick, currentSlide, nextSlide) {
        }
    }
};



  $scope.createCart = function(user) {
    var cookieData = {};
    cookieData.cookie = user;
    userService.tempCart(cookieData).then(function(response) {
      if (response.data.status == 200) {
        $state.go('user.framesType', {});
      } else {
        console.log("Order Can not set")
      }
    });
  }


  $scope.setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }


  $scope.getCookie = function(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  $scope.getInspirationalImages = function() {
    userService.getInspirationalImages().then(function(response) {
      if (response) {
        $timeout(function() {
          $scope.data = response.data;
        });
      }
    }, function(error) {
      toastr.error("Unsucessfull");
    })
  }

  $scope.getUser = function() {
    $scope.obj.loading = true;
    userService.getUserInfo().then(function success(userData) {
      $scope.userData = userData.data.userData;
      $scope.obj.loading = false;
    }, function error(err) {
      toastr.error("Unsucessfull");
      $scope.obj.loading = false;
    })
  }

  $scope.newPassword = function(value) {
    $scope.showPass = value;
  };

  $scope.editInfo = function(value) {
    if(value === 'personal') {
      $scope.obj = {};
      $scope.obj.personal = true;
      $scope.obj.billing = false;
      $scope.obj.shipping = false;
      $scope.Personal = {};
      $scope.Personal.firstName = $scope.userData.firstName;
      $scope.Personal.lastName = $scope.userData.lastName;
      $scope.Personal.email = $scope.userData.email;
    }
    else if(value === 'billing') {
      $scope.obj = {};
      $scope.obj.personal = false;
      $scope.obj.billing = true;
      $scope.obj.shipping = false;
      $scope.Billing = $scope.userData.billingAddress;
    }
    else if(value === 'shipping') {
      $scope.obj = {};
      $scope.obj.personal = false;
      $scope.obj.billing = false;
      $scope.obj.shipping = true;
      $scope.Shipping = $scope.userData.shippingAddress ;
    }
  }


  $scope.updateBilling = function(Billing) {
    $scope.obj.loading = true;
    userService.updateBilling(Billing).then(function success(resposnse) {
      toastr.success("Sucessfully Updated");
      $scope.Billing = {};
      $scope.userData = {};
      $state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
      $scope.obj.loading = false;
    }, function error(err) {
      toastr.error("Unsucessfull");
      $scope.obj.loading = false;
    });
  }

  $scope.updateShipping = function(Shipping) {
    $scope.obj.loading = true;
    userService.updateShipping(Shipping).then(function success(resposnse) {
      toastr.success("Sucessfully Updated");
      $scope.Shipping = {};
      $scope.userData = {};
      $state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
      $scope.obj.loading = false;
    }, function error(err) {
      toastr.error("Unsucessfull");
      $scope.obj.loading = false;
    });
  }

  $scope.updatePersonal = function(Personal) {
    $scope.obj.loading = true;
    userService.updatePersonal(Personal).then(function success(resposnse) {
      toastr.success("Sucessfully Updated");
      $scope.Personal = {};
      $scope.userData = {};
      $state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
      $scope.obj.loading = false;
    }, function error(err) {
      toastr.error("Unsucessfull");
      $scope.obj.loading = false;
    });
  }

});


