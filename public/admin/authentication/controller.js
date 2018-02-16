"use strict";

angular.module("Authentication");

framebridge.controller('loginController', ['$scope', '$rootScope', '$location', 'AuthenticationService', '$localStorage', '$auth', 'rememberMe', '$stateParams', '$state', 'toastr', function($scope, $rootScope, $location, AuthenticationService, $localStorage, $auth, rememberMe, $stateParams, $state, toastr) {
    self = this;
    var inputJSON = {};
    //login
    $scope.login = function() {consloe.log('Login Authentication!!!!!!!!!!!!');
        $scope.showloader = true;
        inputJSON.username = $scope.username;
        inputJSON.password = $scope.password;
        if ($scope.remember_me) {
            //remember from here 
            self.rememberMe();
        }
        AuthenticationService.Login(inputJSON, function(response) {
            $scope.showloader = false;
            var errorMessage = '';
            if (response.messageId == 200) {
                if (response.userType == 2) {
                    if (response.status == 'approved') {
                        $scope.$emit('loginCallforCanvas');
                        if (response.data.user.is_status && !response.data.user.is_deleted) {
                            $localStorage.userLoggedIn = true;
                            $localStorage.loggedInUsername = $scope.username;
                            $localStorage.loggedInUsertype = response.userType;
                            $localStorage.loggedInUser = response.data;
                            $localStorage.authorizationToken = response.access_token;

                            $location.path('/');
                        } else {
                            toastr.error(messagesConstants.accountDeactivated);
                        }
                    } else if (response.status == 'disapproved') {
                        errorMessage = response.message;
                        toastr.error(errorMessage);
                    }
                } else if (response.userType == 1) { //Web-Admin of Clinician
                    if(response.status == 'inactive'){
                        toastr.error(response.message);
                    }else{
                        $scope.$emit('loginCallforCanvas');
                        $localStorage.userLoggedIn = true;
                        $localStorage.loggedInUsername = $scope.username;
                        $localStorage.loggedInUsertype = response.userType;
                        $localStorage.loggedInUser = response.data;
                        $localStorage.authorizationToken = response.access_token;
                        $location.path('/adminhome');
                    }
                } else if (response.userType == 5) { //SuperAdmin
                    $scope.$emit('loginCallforCanvas');
                    $localStorage.userLoggedIn = true;
                    $localStorage.loggedInUsername = $scope.username;
                    $localStorage.loggedInUsertype = response.userType;
                    $localStorage.loggedInUser = response.data;
                    $localStorage.authorizationToken = response.access_token;
                    $location.path('/superhome');
                }else{
                    if(response.status == 'error'){
                        toastr.error(response.message);
                    }
                }
            } else {
                if (response == "Unauthorized") {
                    errorMessage = messagesConstants.usernamePasswordError;
                }
                toastr.error(errorMessage);
            }
        });
    };

    $scope.myFunc = function() {
        $scope.offcanvas = !$scope.offcanvas;
    }

    if ($localStorage.userLoggedIn) {
        $scope.offcanvas = true;
    } else {
        $scope.offcanvas = false;
    }

    $rootScope.$on("logoutCallforCanvas", function(event) {
        $scope.offcanvas = false;
    });

    $rootScope.$on("loginCallforCanvas", function(event) {
        $scope.offcanvas = true;
    });

    //logout
    $scope.logout = function() {
        //$scope.$emit('logoutCallforCanvas');
        $localStorage.$reset();
        $rootScope.loggedInUser = false;
        $rootScope.loggedInUserType = false;
        $rootScope.userLoggedIn = false;
        $location.path('/login');
    }


    /*
     * Created By: Jatinder Singh
     * Function : Send Password reset link with  token
     * Created on : 27 June 2016
     */
    $scope.showloader = false;
    $scope.resendPassword = function() {
        $scope.showloader = true;
        inputJSON = '{"email":' + '"' + $scope.email + '"}';
        // Setup the loader
        if (typeof $scope.email != 'undefined') {
            AuthenticationService.resendPassword(inputJSON, function(response) {
                $scope.showloader = false;
                if (response.messageId == 203) {
                    toastr.error(response.message);
                } else {
                    toastr.success(messagesConstants.passwordResetLinkSuccess);
                }
                $state.reload();
            });
        } else {
            $scope.showloader = false;
            toastr.error(messagesConstants.passwordResetEmailError);
            $state.reload();
        }
    }

    //forgot password
    $scope.resendUsername = function() {
        inputJSON = '{"email":' + '"' + $scope.email + '"}';
        AuthenticationService.resendUsername(inputJSON, function(response) {
            if (response.messageId == 200) {
                $scope.message = response.message;
            } else {
                $scope.message = response.message;
            }
        });
    }


    //authentication
    $scope.authenticate = function(provider) {
        $auth.authenticate(provider)
            .then(function(response) {
                //success
                $localStorage.userLoggedIn = true;
                $localStorage.loggedInUsername = response.data.displayName;
                $localStorage.loggedInUsertype = 1;
                $location.path('/home');
            })
            .catch(function(response) {

                $scope.error = response.data.message;
                $location.path('/login');
            });

    };

    /*
     * Created By: Jatinder Singh
     * Function : Reset Password with validating token
     * Created on : 27 June 2016
     */

    $scope.resetPassword = function(response1) {
        $scope.showloader = true;
        var ciphertext = CryptoJS.AES.encrypt(JSON.stringify($scope.Data.password), messagesConstants.encryptionKey);
        inputJSON.password = ciphertext.toString();
        inputJSON.token = $stateParams.token;
        AuthenticationService.resetPassword(inputJSON, function(response) {
            $scope.showloader = false;
            if (response.code == 200) {
                toastr.success(messagesConstants.passwordResetSuccess);
                $state.go("login");
            } else {
                toastr.error("Password reset token has been already used.");
            }
            $rootScope.showLogin = true;
        });
    }

    // Developer Rajesh 
    $scope.userData = {};
    $scope.changePassword = function() {
        $scope.showloader = true;
        var user_id = $localStorage.loggedInUser.user._id;
        var inputJSON = { "_id": user_id, "password": $scope.userData.password, "newpassword": $scope.userData.newpassword };
        var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(inputJSON.newpassword), messagesConstants.encryptionKey);
        inputJSON.newpassword = ciphertext.toString();
        AuthenticationService.changePassword(inputJSON, function(response) {
            $scope.showloader = false;
            if (response.messageId == 203) {
                toastr.error(messagesConstants.oldPasswordError);
            } else if (response.messageId == 201) {
                toastr.error(messagesConstants.oldNewPasswordSameError);
            }else{
                toastr.success(messagesConstants.passwordChangeSuccess);
                $scope.$emit('logoutCallforCanvas');
                $localStorage.$reset();
                $rootScope.loggedInUser = false;
                $rootScope.loggedInUserType = false;
                $rootScope.userLoggedIn = false;
                $state.go("login");
            }
        });
    }

    // Developer Rajesh 
    // Linking Change password screen on the basis of user type

    if ($localStorage.loggedInUsertype == 1) {
        $scope.homescreen = "/#/adminhome";
    } else if ($localStorage.loggedInUsertype == 2) {
        $scope.homescreen = "/#/home";
    } else if ($localStorage.loggedInUsertype == 5) {
        $scope.homescreen = "/#/superhome";
    }

    $scope.goBack = function() {
        window.history.back();
    }

    /**
     * @author:Gurpreet Singh
     * this condition checks whether the user is remembered or not
     *
     */
    if (rememberMe('7ZXYZ@L') && rememberMe('UU@#90')) {
        $scope.username = atob(rememberMe('7ZXYZ@L'));
        $scope.password = atob(rememberMe('UU@#90'));
    }

    /**
     * @author:Gurpreet Singh 
     * this method is called to remember the user's username and password
     *
     */
    self.rememberMe = function() {
        if ($scope.remember_me) {
            rememberMe('7ZXYZ@L', btoa($scope.username));
            rememberMe('UU@#90', btoa($scope.password));
        } else {
            rememberMe('7ZXYZ@L', '');
            rememberMe('UU@#90', '');
        }
    };

    $scope.openResetPassword = function(){
        $scope.$emit('logoutCallforCanvas');
        $localStorage.$reset();
        $rootScope.loggedInUser = false;
        $rootScope.loggedInUserType = false;
        $rootScope.userLoggedIn = false;
    }
}]);
