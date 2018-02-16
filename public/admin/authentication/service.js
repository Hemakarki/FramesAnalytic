'use strict'

angular.module('Authentication')
.factory('AuthenticationService', ['communicationService', '$rootScope',
    function(communicationService, $rootScope) {

      var service = {};

      service.Login = function(inputJsonString, callback) {
        communicationService.resultViaPost(webservices.authenticate, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
          callback(response.data);

        });
      };

      service.resendPassword = function(inputJsonString, callback) {
        communicationService.resultViaPost(webservices.forgot_password, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
          callback(response.data);
        });
      }

      service.resendUsername = function(inputJsonString, callback) {
        communicationService.resultViaPost(webservices.forgot_username, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
          callback(response.data);
        });
      }
      service.resetPassword = function(inputJsonString, callback) {
        communicationService.resultViaPost(webservices.reset_password, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
          callback(response.data);
        });
      } 

      service.changePassword = function(inputJsonString, callback) {
        var serviceURL = webservices.change_password;
        communicationService.resultViaPost(serviceURL, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
          callback(response.data);
        });
      } 

      return service;
    }
  ])
  .factory('rememberMe', function() {
    function fetchValue(name) {
      var gCookieVal = document.cookie.split("; ");
      for (var i = 0; i < gCookieVal.length; i++) {
        // a name/value pair (a crumb) is separated by an equal sign
        var gCrumb = gCookieVal[i].split("=");
        if (name === gCrumb[0]) {
          var value = '';
          try {
            value = angular.fromJson(gCrumb[1]);
          } catch (e) {
            value = unescape(gCrumb[1]);
          }
          return value;
        }
      }
      // a cookie with the requested name does not exist
      return null;
    }
    return function(name, values) {
      if (arguments.length === 1) return fetchValue(name);
      var cookie = name + '=';
      if (typeof values === 'object') {
        var expires = '';
        cookie += (typeof values.value === 'object') ? angular.toJson(values.value) + ';' : values.value + ';';
        if (values.expires) {
          var date = new Date();
          date.setTime(date.getTime() + (values.expires * 24 * 60 * 60 * 1000));
          expires = date.toGMTString();
        }
        cookie += (!values.session) ? 'expires=' + expires + ';' : '';
        cookie += (values.path) ? 'path=' + values.path + ';' : '';
        cookie += (values.secure) ? 'secure;' : '';
      } else {
        cookie += values + ';';
      }
      document.cookie = cookie;
    }
  });