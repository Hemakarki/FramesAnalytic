"use strict";
/**
 * @ngdoc function
 * @name app.config:uiRouter
 * @description
 * # Config
 * Config for the router
 */
angular.module("Authentication", []);

var framebridge = angular
  .module("framebridge", [
    "uiCropper",
    "ngAnimate",
    "ngAria",
    "ngCookies",
    "ngMessages",
    "ngResource",
    "ngSanitize",
    "ngTouch",
    "ngTable",
    "ngMaterial",
    "ngStorage",
    "naif.base64",
    "ngStore",
    "ui.router",
    "ui.utils",
    "ui.bootstrap",
    "ui.load",
    "ui.jp",
    "pascalprecht.translate",
    "oc.lazyLoad",
    "angular-loading-bar",
    "angular-img-cropper",
    "angularUtils.directives.dirPagination",
    "Authentication",
    "ckeditor",
    "toastr"
  ])

  .filter("trusted", function($sce) {
    return function(html) {
      return $sce.trustAsHtml(html);
    };
  })
  .run([
    "$rootScope",
    "$state",
    "$stateParams",
    function($rootScope, $state, $stateParams) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
    }
  ])

  .factory("basicAuthenticationInterceptor", [
    "$localStorage",
    function($localStorage) {
      var basicAuthenticationInterceptor = {
        request: function(config) {
          if ($localStorage.authorizationToken)
            config.headers["Authorization"] =
              "Bearer " + $localStorage.authorizationToken;
          // config.headers['Authentication'] = 'Basic ' + appConstants.authorizationKey;
          config.headers["Content-Type"] = headerConstants.json;
          return config;
        }
      };
      return basicAuthenticationInterceptor;
    }
  ])

  .config([
    "$stateProvider",
    "$urlRouterProvider",
    "$httpProvider",
    "$locationProvider",
    "$translateProvider",
    "paginationTemplateProvider",
    function(
      $stateProvider,
      $urlRouterProvider,
      $httpProvider,
      $locationProvider,
      $translateProvider,
      paginationTemplateProvider
    ) {
      // $locationProvider.html5Mode(true);
      $httpProvider.interceptors.push("basicAuthenticationInterceptor");
      $stateProvider
        .state("/", {
          url: "/",
          templateUrl: "./../views/user/home/home.html"
        })

        .state("admin", {
          abstract: true,
          views: {
            "": {
              templateUrl: "./../views/layout.html"
            },
            aside: {
              templateUrl: "./../views/aside.html"
            },
            content: {
              templateUrl: "./../views/content.html"
            }
          }
        })

        .state("access", {
          url: "/access",
          template:
            '<div class="indigo bg-big"><div ui-view class="fade-in-down smooth"></div></div>'
        })

        .state("access.login", {
          url: "/login",
          templateUrl: "/controllers/auth/login/login.view.html",
          controller: "loginCtrl",
          controllerAs: "vm",
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/controllers/auth/login/login.controller.js",
                      "/controllers/common/services/authentication.service.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("access.forgot-password", {
          url: "/forgot-password",
          controller: "loginController",
          templateUrl: "views/authentication/forgot-password.html",
          loginRequired: false,
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/controllers/authentication/authenticationService.js",
                      "/controllers/authentication/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("access.register", {
          url: "/register",
          templateUrl: "/scripts/controllers/auth/register/register.view.html",
          controller: "registerCtrl",
          controllerAs: "vm",
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/controllers/auth/register/register.controller.js",
                      "/controllers/common/services/authentication.service.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("admin.dashboard", {
          url: "/dashboard",
          templateUrl: "/admin/dashboard/views/dashboard.html",
          controller: "adminController"
        })

        .state("admin.managePages", {
          url: "/managePages",
          templateUrl: "/admin/cms/views/managePages.html",
          controller: "adminController"
        })

        .state("admin.addPage", {
          url: "/addPages",
          templateUrl: "/admin/cms/views/addPages.html",
          controller: "adminController"
        })

        .state("admin.editPage", {
          url: "/editPage/:id",
          templateUrl: "/admin/cms/views/editPages.html",
          controller: "adminController"
        })

        .state("admin.listTemplates", {
          url: "/listTemplates",
          templateUrl:
            "/admin/email_template/views/manageTemplates.html",
          controller: "emailTemplateController",
          data: {
            // title: 'List Email Template',
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/email_template/service.js",
                      "/admin/email_template/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("admin.addTemplate", {
          url: "/addTemplate",
          templateUrl: "/admin/email_template/views/addTemplate.html",
          controller: "emailTemplateController",
          data: {
            //title: 'List Email Template',
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/email_template/service.js",
                      "/admin/email_template/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("admin.editTemplate", {
          url: "/editTemplate/:id",
          controller: "emailTemplateController",
          templateUrl: "/admin/email_template/views/editTemplate.html",
          data: {
            //title: 'List Email Template',
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/email_template/service.js",
                      "/admin/email_template/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("admin.listFrames", {
          url: "/listFrames",
          templateUrl: "/admin/frames/listFrames/views/listFrames.html",
          controller: "listFrameController",
          data: {
            title: "List Frame",
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/frames/listFrames/listFramesServices.js",
                      "/admin/frames/listFrames/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("admin.addFrames", {
          url: "/addFrames",
          controller: "addFrameController",
          templateUrl: "/admin/frames/addFrames/views/addFrames.html",
          data: {
            title: "Add Frame",
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/frames/addFrames/addFramesServices.js",
                      "/admin/frames/addFrames/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
          // resolve: load(['/scripts/controllers/frames/addFrames/controller.js', '/scripts/controllers/vectormap.js', '/scripts/controllers/frames/addFrames/addFramesServices.js'])
        })

        .state("admin.detailFrames", {
          url: "/detailFrames/:foo",
          controller: "detailFrameController",
          templateUrl:
            "/admin/frames/detailFrames/views/detailFrames.html",
          data: {
            title: "Frame Detail",
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/frames/detailFrames/detailFramesServices.js",
                      "/admin/frames/detailFrames/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
          // resolve: load(['/scripts/controllers/frames/detailFrames/controller.js', '/scripts/controllers/vectormap.js', '/scripts/controllers/frames/detailFrames/detailFramesServices.js'])
        })

        .state("admin.editFrame", {
          url: "/editFrame/:foo",
          controller: "editFrameController",
          templateUrl: "/admin/frames/editFrames/views/editFrame.html",
          data: {
            title: "Edit Frame",
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/frames/editFrames/editFrameServices.js",
                      "/admin/frames/editFrames/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("admin.editFrameImage", {
          url: "/editFrameImage/:foo",
          controller: "editFrameController",
          templateUrl:
            "/admin/frames/editFrames/views/editFrameImage.html",
          data: {
            title: "Edit Frame",
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/frames/editFrames/editFrameServices.js",
                      "/admin/frames/editFrames/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("admin.listUsers", {
          url: "/listUsers",
          templateUrl: "/views/user/listUsers.html",
          controller: "adminController",
          data: {
            title: "List Users",
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/adminServices.js",
                      "/admin/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("admin.userDetails", {
          url: "/userDetails/:id",
          templateUrl: "/views/user/userDetails.html",
          controller: "adminController",
          data: {
            title: "List Users",
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/adminServices.js",
                      "/admin/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("admin.userOrders", {
          url: "/userOrders/:id",
          templateUrl: "/views/user/userOrderDetails.html",
          controller: "adminController",
          data: {
            title: "List Users",
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/adminServices.js",
                      "/admin/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("admin.listOrders", {
          url: "/listOrders",
          templateUrl: "/views/user/listOrders.html",
          controller: "adminController",
          data: {
            title: "List Orders",
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/adminServices.js",
                      "/admin/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("admin.orderInfo", {
          url: "/orderIinfo/:orderId",
          templateUrl: "/admin/orders/views/ordersInfo.html",
          controller: "orderController",
          data: {
            title: "List Orders",
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/orders/orderServices.js",
                      "/admin/orders/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("admin.listUserOrders", {
          url: "/listUserOrders/:id",
          templateUrl: "/views/user/listUserOrders.html",
          controller: "adminController",
          data: {
            title: "List Orders",
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/adminServices.js",
                      "/admin/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        .state("admin.orderDetail", {
          url: "/orderDetail/:id",
          templateUrl: "/views/user/orderDetail.html",
          controller: "adminController",
          data: {
            title: "Order Details",
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/adminServices.js",
                      "/admin/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        /*.state('admin.product_report', {
                url: '/product',
                templateUrl: '/admin/reports/product/view/product_report.html',
                // controller: 'productReportController',
                data: {
                    folded: false
                },
                resolve: {
                    loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: "framebridge",
                            files: [
                                '/admin/reports/product/productReportServices.js',
                                '/admin/reports/product/controller.js'
                            ]
                        }).then(function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }]
                }
            })*/

        .state("admin.payment_report", {
          url: "/payment",
          templateUrl:
            "/admin/reports/payment/view/payment_report.html",
          controller: "paymentReportController",
          data: {
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/reports/payment/paymentReportServices.js",
                      "/admin/reports/payment/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        })

        /*.state('admin.sales_report', {
                url: '/sales',
                templateUrl: '/admin/reports/sales/view/sales_report.html',
                // controller: 'salesReportController',
                data: {
                    folded: false
                },
                resolve: {
                    loadModule: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: "framebridge",
                            files: [
                                '/admin/reports/sales/salesReportServices.js',
                                '/admin/reports/sales/controller.js'
                            ]
                        }).then(function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }]
                }
            })*/

        .state("admin.add_inspirational", {
          url: "/add_inspirational",
          templateUrl:
            "/admin/inspirational/views/add_inspirational.html",
          controller: "adminController"
        })

        .state("admin.list_inspirational", {
          url: "/list_inspirational",
          templateUrl:
            "/admin/inspirational/views/list_inspirational.html",
          controller: "adminController"
        })

        .state("admin.edit_inspirational", {
          url: "/edit_inspirational/:id",
          templateUrl:
            "/admin/inspirational/views/edit_inspirational.html",
          controller: "adminController"
        })

        .state("admin.add_promo_code", {
          url: "/add_promo_code",
          templateUrl: "/admin/promo_code/views/add_promo_code.html",
          controller: "promoCodeController"
        })

        .state("admin.list_promo_code", {
          url: "/list_promo_code",
          templateUrl: "/admin/promo_code/views/list_promo_code.html",
          controller: "promoCodeController"
        })

        .state("admin.edit_promo", {
          url: "/edit_promo/:id",
          templateUrl: "/admin/promo_code/views/edit_promo_code.html",
          controller: "promoCodeController"
        })

        .state("admin.add_seo", {
          url: "/add_seo",
          templateUrl: "/admin/seo/views/add_seo.html",
          controller: "seoController"
        })

        .state("admin.list_seo", {
          url: "/list_seo",
          templateUrl: "/admin/seo/views/list_seo.html",
          controller: "seoController"
        })

        .state("admin.edit_seo", {
          url: "/edit_seo/:id",
          templateUrl: "/admin/seo/views/edit_seo.html",
          controller: "seoController"
        })

        .state("admin.image_cropper", {
          url: "/image_cropper",
          templateUrl: "/admin/imgCropper/views/img-cropper.html",
          controller: "imageController"
        })

        .state("admin.editDetails", {
          url: "/editDetails/:id",
          templateUrl: "views/user/editDetails.html",
          controller: "adminController"
        })

        .state("admin.addDate", {
          url: "/addDate",
          templateUrl: "/admin/checkout/views/checkout.html",
          controller: "adminController"
        })

        .state("admin.expressDelivery", {
          url: "/delivery",
          templateUrl: "/admin/checkout/views/delivery.html",
          controller: "adminController"
        })

        .state("admin.size_cost", {
          url: "/sizecost",
          templateUrl: "/admin/size_cost/views/size_cost.html",
          controller: "size_costController",
          data: {
            title: "Size & Cost",
            folded: false
          },
          resolve: {
            loadModule: [
              "$ocLazyLoad",
              "$q",
              function($ocLazyLoad, $q) {
                var deferred = $q.defer();
                $ocLazyLoad
                  .load({
                    name: "framebridge",
                    files: [
                      "/admin/size_cost/sizecostService.js",
                      "/admin/size_cost/controller.js"
                    ]
                  })
                  .then(function() {
                    deferred.resolve();
                  });
                return deferred.promise;
              }
            ]
          }
        });

      $urlRouterProvider.otherwise("/access/login");
    }
  ]);

framebridge.config([
  "$controllerProvider",
  function($controllerProvider) {
    // this option might be handy for migrating old apps, but please don't use it
    // in new ones!
    $controllerProvider.allowGlobals();
  }
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
framebridge.config([
  "$ocLazyLoadProvider",
  function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
      // global configs go here
      // debug:true,
      // events:true
    });
  }
]);
