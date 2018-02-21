'use strict';

/**
 * @ngdoc function
 * @name app.config:uiRouter
 * @description
 * # Config
 * Config for the router
 */
angular.module("Authentication", []);



var framebridge = angular.module("framebridge", [
  // 'uiCropper',
  'ngAnimate',
  'ngAria',
  'ngCookies',
  'ngMessages',
  'ngResource',
  'ngSanitize',
  'ngTouch',
  'ngMaterial',
  'ngStorage',
  'naif.base64',
  'ngStore',
  'ui.router',
  'ui.utils',
  'ui.bootstrap',
  'angularModalService',
  'ui.load',
  'angular-uuid',
  'ui.jp',
  'pascalprecht.translate',
  'oc.lazyLoad',
  'angular-loading-bar',
  'angular-img-cropper',
  'angularUtils.directives.dirPagination',
  'Authentication',
  'toastr',
  'slickCarousel',

])

 .filter('trusted', function($sce){
        return function(html){
            return $sce.trustAsHtml(html)
        }
     })
.factory('basicAuthenticationInterceptor', ['$localStorage', function($localStorage) {

  var basicAuthenticationInterceptor = {
    request: function(config) {
      if ($localStorage.authorizationToken)
        config.headers['Authorization'] = 'Bearer ' + $localStorage.authorizationToken;
      // config.headers['Authentication'] = 'Basic ' + appConstants.authorizationKey;
      config.headers['Content-Type'] = headerConstants.json;
      return config;
    }
  };
  return basicAuthenticationInterceptor;
}])

var authenticate = function($q, $http, $window, $location) {
  var deferred = $q.defer();
  $http.get('/users/checkSession').then(function(response) {
    if (response.data.status == 200) {
      deferred.resolve("Success");
    } else {
      deferred.reject();
      var protocol = $location.protocol();
      var host = protocol + '://' + $location.host();
      var port = $location.port();
      var FullLink = host + ':' + port + '/#/login';
      $window.location.href = FullLink;
    }
    return deferred.promise;
  })
};



framebridge.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider',
    '$translateProvider', 'paginationTemplateProvider',
    function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider,
      $translateProvider, paginationTemplateProvider) {
      // $locationProvider.html5Mode(true);

      $httpProvider.interceptors.push('basicAuthenticationInterceptor');
      $stateProvider
        .state('/', {
          url: '/',
          templateUrl: '/views/user/home.html',
          controller: 'userController',
          resolve: {

            loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
              var deferred = $q.defer();
              $ocLazyLoad.load({
                name: "framebridge",
                files: [
                  '/controllers/user/home/controller.js',
                  '/controllers/user/home/userServices.js'
                ]
              }).then(function() {
                auth: authenticate;
              }).then(function() {
                deferred.resolve();
              })
              return deferred.promise;
            }]

          }
        })

      .state('404', {
          url: '/404',
          templateUrl: 'views/pages/404.html'
        })
        .state('505', {
          url: '/505',
          templateUrl: 'views/pages/505.html'
        })
        .state('admin', {
          abstract: true,
          url: '/admin',
          views: {
            '': {
              templateUrl: 'views/layout.html'
            },
            'aside': {
              templateUrl: 'views/aside.html'
            },
            'content': {
              templateUrl: 'views/content.html'
            }
          }
        })

      .state('user', {
        views: {
          '': {
            templateUrl: 'views/content.html',
          }
        }
      })


      .state('login', {
        url: '/login',
        templateUrl: '/controllers/auth/login/user.login.view.html',
        controller: 'loginCtrl',
        controllerAs: 'vm',
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/auth/login/login.controller.js',
                '/controllers/common/services/authentication.service.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })



      .state('forgot-password', {
        url: "/forgot-password",
        controller: 'forgotPasswordCtrl',
        templateUrl: '/controllers/auth/forgot-password/user-forgot-password.view.html',
        loginRequired: false,
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/auth/forgot-password/forgot-password.controller.js',
                '/controllers/common/services/authentication.service.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })



      .state('register', {
        url: '/register',
        templateUrl: '/controllers/auth/register/register.view.html',
        controller: 'registerCtrl',
        controllerAs: 'vm',
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/auth/register/register.controller.js',
                '/controllers/common/services/authentication.service.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })


      .state('user.compare', {
        url: '/compare',
        templateUrl: '/views/user/compare.html',
        controller: 'compareController',
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/user/compare/controller.js',
                '/controllers/user/compare/compareService.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })




      .state('user.products', {
        url: '/products',
        templateUrl: '/views/user/products.html',
        controller: 'productsController',
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/user/products/controller.js',
                '/controllers/user/products/productsService.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })


      .state('user.framesType', {
        url: '/framesType',
        templateUrl: 'views/user/framesType.html',
        data: {
          title: '',
          folded: true
        }
      })

      .state('user.editImage', {
        url: '/editImage',
        templateUrl: 'views/user/editImage.html',
        controller: 'editImageController',
        data: {
          title: '',
          folded: true
        },
        params: {
          myParam: "check"
        },
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/user/editImage/editImageServices.js',
                '/controllers/user/editImage/controller.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })


       .state('user.artWork', {
        url: '/artWork',
        templateUrl: 'views/user/artWork.html',
        controller: 'artWorkController',
        data: {
          title: '',
          folded: true
        },
        params: {
          myParam: "artType"
        },
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/user/artWork/artWorkServices.js',
                '/controllers/user/artWork/controller.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })


      .state('user.frames', {
        url: '/frames/:artType',
        templateUrl: 'views/user/frames.html',
        controller: 'framesController',
        data: {
          title: '',
          folded: false
        },
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/user/frames/framesServices.js',
                '/controllers/user/frames/controller.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })


      .state('user.framePreview', {
        // url : '/editImage?imagePath',
        url: '/framePreview?foo?imageType',
        templateUrl: 'views/user/framePreview.html',
        controller: 'framePreviewController',
        data: {
          title: '',
          folded: false
        },
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/user/framePreview/framePreviewServices.js',
                '/controllers/user/framePreview/controller.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })

      .state('user.imageSize', {
        url: '/imageSize/:imageType',
        templateUrl: 'views/user/imageSize.html',
        controller: 'dgImgSizeController',
        data: {
          title: '',
          folded: false
        },

        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/user/DigitalImageSize/dgImgServices.js',
                '/controllers/user/DigitalImageSize/controller.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })


      .state('user.addToCart', {
        url: '/cart',
        templateUrl: 'views/user/cart.html',
        controller: 'cartController',
        data: {
          title: '',
          folded: false
        },
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/user/addToCart/cartServices.js',
                '/controllers/user/addToCart/controller.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })


      .state('user.checkout', {
        url: '/checkout',
        templateUrl: 'views/user/checkout.html',
        controller: 'checkoutController',
        data: {
          title: '',
          folded: false
        },
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/common/services/authentication.service.js',
                '/controllers/user/checkout/checkoutServices.js',
                '/controllers/user/checkout/controller.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })


      .state('user.instagramPhoto', {
        url: '/instagram',
        templateUrl: 'views/user/instagram.html',
        controller: 'instagramController',
        data: {
          title: '',
          folded: false
        },
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/user/instagram/controller.js',
                '/controllers/user/instagram/service.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })



      .state('user.myAccount', {
        url: '/account',
        templateUrl: 'views/user/my_account.html',
        controller: 'userController',
        data: {
          title: '',
          folded: false
        },
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/user/home/controller.js',
                '/controllers/user/home/userServices.js'
              ]
            }).then(function() {
              auth: authenticate;
            }).then(function() {
              deferred.resolve();
            })
            return deferred.promise;
          }],
          auth: authenticate
        }
      })




      .state('user.orders', {
        url: '/orders',
        templateUrl: 'views/user/orders.html',
        controller: 'orderController',
        data: {
          title: '',
          folded: false
        },
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/user/orders/controller.js',
                '/controllers/user/orders/orderServices.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }],
          auth: authenticate
        }
      })

      .state('user.shippingAddress', {
        url: '/shippingAddress',
        templateUrl: 'views/user/shippingAddress.html',
        controller: 'shippingController',
        data: {
          title: '',
          folded: false
        },
        resolve: {
          loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: "framebridge",
              files: [
                '/controllers/user/shipping/shippingServices.js',
                '/controllers/user/shipping/controller.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })

      .state('user.pages', {
        url: '/pages/:page',
        templateUrl: 'admin/pages/views/pages.html',
        controller: 'PageController'
      })

      .state('user.sample_art',{
         url:'/sample_art',
         templateUrl:'views/user/sample_art.html',
         controller:'artWorkController'
      })



      $urlRouterProvider
        .otherwise('/');
    }
    
  ])
  .run(
    ['$rootScope', '$state', '$stateParams', '$http',
      function($rootScope, $state, $stateParams, $http) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        });

        $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams, userInfo) {
          if (toState.name == "user.frames") {
            var obj = {};
            obj.param = "";
            obj.stateTosend = "frames"
            $http.post('/users/getMetaData', obj).then(function(response) {
              if (response) {
                $rootScope.metaTag = response.data.keyword;
                $rootScope.metaDescription = response.data.description;
              } else {

              }
              // return deferred.promise;
            })
          } else if (toState.name == "user.pages") {
            var obj = {};
            obj.param = $stateParams.page;
            obj.stateTosend = "pages";
            $http.post('/users/getMetaData', obj).then(function(response) {
              if (response) {
                $rootScope.metaTag = response.data.seoTitle;
                $rootScope.metaDescription = response.data.seoDescription;
              
              } else {

              }
              // return deferred.promise;
            })
          } else {
            var obj = {};
            obj.param = "";
            obj.stateTosend = "general"
            $http.post('/users/getMetaData',obj).then(function(response) {
              if (response) {
                 $rootScope.metaTag = response.data.keyword;
                 $rootScope.metaDescription = response.data.description;
              } else {
                console.log("Response is ", response);
              }
              // return deferred.promise;
            })
          }
        });

        $rootScope.$on("$stateChangeError", function(evt, toState, toParams, fromState, fromParams, error) {})
      }
    ]
  )

  .directive('googleBilling', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, model) {
        var options = {
          types: [],
          componentRestrictions: {
            'country': 'au'
          }
        };
        scope['gPlace' + parseInt(attrs.index)] = new google.maps.places.Autocomplete(element[0], options);
        google.maps.event.addListener(scope['gPlace' + parseInt(attrs.index)], 'place_changed', function() {
          scope.$apply(function() {
            model.$setViewValue(element.val());
            var details = scope['gPlace' + parseInt(attrs.index)].getPlace();
            if (attrs.billing == "true") {
              var variable = attrs.setvariable ? attrs.setvariable : 'Billing';
              angular.element(element).val(details.formatted_address);
              var gotCity = false;
              var gotState = false;
              var gotZip = false;
              var gotCountry = false;
              scope[variable].street_number = "";
              scope[variable].zip = "";
              scope[variable].locality = "";
              scope[variable].state = "";
              scope[variable].city = "";
              scope[variable].route = "";
              scope[variable].landmark = "";
              scope[variable].landmark = "";
              scope[variable].zipCode = "";
              for (var i = 0; i < details.address_components.length; i++) {
                var addressType = details.address_components[i].types[0];
                var val = details.address_components[i].long_name;
                if (addressType == 'country') {
                  scope[variable].country = val;
                  gotCountry = true;
                }
                if (addressType == 'administrative_area_level_1' || addressType == 'locality' || addressType == 'postal_code' || addressType == 'street_number' || addressType == 'route') {
                  if (addressType == 'administrative_area_level_1') {
                    scope[variable].state = val;
                    gotState = true;
                  }
                  if (addressType == 'locality') {
                    scope[variable].city = val;
                    gotCity = true;
                  }
  
                  if (addressType == 'postal_code') {
                    scope[variable].zip = val;
                    gotZip = true;
                  }
  
                  scope[variable].zipCode = scope[variable].zip ? scope[variable].zip : "Invalid Zip Code";
                }
              }
              if (!gotCountry) {
                scope[variable].country = '';
              }
              if (!gotState) {
                scope[variable].state = '';
              }
              if (!gotCity) {
                scope[variable].city = '';
              }
              if (!gotZip) {
                scope[variable].zip = '';
              }
              if (attrs.update == 'true') {
                var data = {};
                data.patient_id = scope[variable].id;
                data.fields = [];
                data.fields[0] = {}
                data.fields[0].field = 'address';
                data.fields[0].value = scope[variable].address;
                data.fields[1] = {}
                data.fields[1].field = 'city';
                data.fields[1].value = scope[variable].city;
                data.fields[2] = {}
                data.fields[2].field = 'zip';
                data.fields[2].value = scope[variable].zip;
                data.fields[3] = {}
                data.fields[3].field = 'country';
                data.fields[3].value = scope[variable].country;
                data.fields[4] = {}
                data.fields[4].field = 'state';
                data.fields[4].value = scope[variable].state;
                scope.finalStep(data)
              }
            } else {
              angular.element(element).val(details.name + ', ' + details.formatted_address);
            }
          });
        });
      }
    };
  })

  .directive('googleShipping', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, model) {
        var options = {
          types: [],
          componentRestrictions: {
            'country': 'au'
          }
        };
        scope['gPlace' + parseInt(attrs.index)] = new google.maps.places.Autocomplete(element[0], options);
        google.maps.event.addListener(scope['gPlace' + parseInt(attrs.index)], 'place_changed', function() {
          scope.$apply(function() {
            model.$setViewValue(element.val());
            var details = scope['gPlace' + parseInt(attrs.index)].getPlace();
            if (attrs.shipping == "true") {
              var variable = attrs.setvariable ? attrs.setvariable : 'Shipping';
              angular.element(element).val(details.formatted_address);
              var gotCity = false;
              var gotState = false;
              var gotZip = false;
              var gotCountry = false;
              scope[variable].street_number = "";
              scope[variable].zip = "";
              scope[variable].locality = "";
              scope[variable].state = "";
              scope[variable].city = "";
              scope[variable].route = "";
              scope[variable].landmark = "";
              scope[variable].landmark = "";
              scope[variable].zipCode = "";
              for (var i = 0; i < details.address_components.length; i++) {
                var addressType = details.address_components[i].types[0];
                var val = details.address_components[i].long_name;
                if (addressType == 'country') {
                  scope[variable].country = val;
                  gotCountry = true;
                }
                if (addressType == 'administrative_area_level_1' || addressType == 'locality' || addressType == 'postal_code' || addressType == 'street_number' || addressType == 'route') {
                  if (addressType == 'administrative_area_level_1') {
                    scope[variable].state = val;
                    gotState = true;
                  }
                  if (addressType == 'locality') {
                    scope[variable].city = val;
                    gotCity = true;
                  }
  
                  if (addressType == 'postal_code') {
                    scope[variable].zip = val;
                    gotZip = true;
                  }
                  scope[variable].zipCode = scope[variable].zip ? scope[variable].zip : "Invalid Zip Code";
                }
              }
              if (!gotCountry) {
                scope[variable].country = '';
              }
              if (!gotState) {
                scope[variable].state = '';
              }
              if (!gotCity) {
                scope[variable].city = '';
              }
              if (!gotZip) {
                scope[variable].zip = '';
              }
              if (attrs.update == 'true') {
                var data = {};
                data.patient_id = scope[variable].id;
                data.fields = [];
                data.fields[0] = {}
                data.fields[0].field = 'address';
                data.fields[0].value = scope[variable].address;
                data.fields[1] = {}
                data.fields[1].field = 'city';
                data.fields[1].value = scope[variable].city;
                data.fields[2] = {}
                data.fields[2].field = 'zip';
                data.fields[2].value = scope[variable].zip;
                data.fields[3] = {}
                data.fields[3].field = 'country';
                data.fields[3].value = scope[variable].country;
                data.fields[4] = {}
                data.fields[4].field = 'state';
                data.fields[4].value = scope[variable].state;
                scope.finalStep(data)
              }
            } else {
              angular.element(element).val(details.name + ', ' + details.formatted_address);
            }
          });
        });
      }
    };
  })

framebridge.filter('truncate', function() {
  return function(text, length, end) {
    if (isNaN(length))
      length = 10;

    if (end === undefined)
      end = "...";

    if (text.length <= length || text.length - end.length <= length) {
      return text;
    } else {
      return String(text).substring(0, length - end.length) + end;
    }
  };
});


framebridge.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
framebridge.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
  $ocLazyLoadProvider.config({

  });
}]);

function checkloggedIn($rootScope, $localStorage, $http) {
  if ($localStorage.userLoggedIn) {
    $rootScope.userLoggedIn = true;
    $rootScope.loggedInUser = $localStorage.loggedInUsername;
    $rootScope.loggedInUserType = $localStorage.loggedInUsertype;
    $rootScope.fullName = $localStorage.loggedInUsername;
    var created_Date = $localStorage.loggedInUser.user.created_date;
    var newDate = new Date(created_Date);
    $rootScope.memberSinceDate = formatDate(newDate);
    $rootScope.profilePic = $localStorage.loggedInUser.user.profile_pic ? "images/profile/" + $localStorage.loggedInUser.user.profile_pic : "images/profile/avatar5.png";
  } else {
    $rootScope.userLoggedIn = false;
  }
}

function checkAdminloggedIn($rootScope, $localStorage, $http, $location) {
  if ($localStorage.userLoggedIn) {
    $rootScope.userLoggedIn = true;
    $rootScope.loggedInUser = $localStorage.loggedInUsername;
    $rootScope.loggedInUserType = $localStorage.loggedInUsertype;
    $rootScope.fullName = $localStorage.loggedInUsername;
    var created_Date = $localStorage.loggedInUser.user.created_date;
    var newDate = new Date(created_Date);
    $rootScope.memberSinceDate = formatDate(newDate);
    $rootScope.profilePic = $localStorage.loggedInUser.user.profile_pic ? "images/profile/" + $localStorage.loggedInUser.user.profile_pic : "images/profile/avatar5.png";
    if ($localStorage.loggedInUsertype != 1) {
      $location.path('/404');
    }
  } else {
    $rootScope.userLoggedIn = false;
  }
}