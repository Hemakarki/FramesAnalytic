framebridge.controller('adminController', function($scope, $http, toastr, $rootScope, $state, $stateParams, adminServices, $localStorage, ngTableParams) {
    $scope.myobj = {};
    $scope.validImage = true;
    $scope.myobj.currentPage = 1;
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;
    $scope.obj = {};
    $scope.obj.loading = false;
    $scope.descErr = false;
    $scope.details = {};
    $scope.days = {};
    $scope.charge = {};
    // Editor options.
    $scope.options = {
        language: 'en',
        allowedContent: true,
        entities: false
    };
    $scope.inspirational = {};


    $scope.validImage = function(imageData) {
        var frameImage = imageData;
        if (frameImage.filetype == "image/png" || "image/jpeg" || "image/jpg") {
            $scope.validImage = true;
        } else {
            $scope.validImage = false;
        }
    }


    $scope.orderStatusArray = [{
        label: 'Open',
        value: 1,
    }, {
        label: 'Complete',
        value: 2,
    }, {
        label: 'In Progress',
        value: 3,
    }]

    $scope.submitInspirationData = function(inspirational) {
        $scope.obj.loading = true;
        adminServices.submitInspirationData(inspirational).then(function(response) {
            if (response) {
                $scope.obj.loading = false;
                toastr.success("Inspiration added successfully!");
                $state.go('admin.list_inspirational');
            }
        }, function(error) {
            $scope.obj.loading = false;
            toastr.error("Error adding Inspiration!");
        });
    }

    $scope.listInspirational = function(search) {
        var passingData = {};
        $scope.obj.loading = true;
        if (search) {
            passingData.search = $scope.search;
        } else {
            passingData.search = '';
        }
        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 5,
            sorting: {
                createdOn: "desc"
            }
        }, {
            counts: [],
            getData: function($defer, params) {
                passingData.page = params.page();
                passingData.count = params.count();
                passingData.sort = params.sorting();

                adminServices.listInspirational(passingData).then(function(response) {

                    if (response) {
                        $scope.obj.loading = false;
                        params.total(response.data.count);
                        $scope.data = response.data.data;

                        if ($scope.data.length == 0) {
                            toastr.info("No Record To Display.");
                        }
                        $scope.skipNo = response.data.skipNo;
                        $defer.resolve($scope.data);
                    }

                }, function(error) {
                    $scope.obj.loading = false;
                    toastr.error("Error retrieving Inspirational Data");
                })
            }
        })
    }

    $scope.deleteInspirationalData = function(payload) {
        swal({
            title: "Do you want to delete the Inspirational Data from list",
            text: "Click OK to delete Page",
            type: "info",
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, function(isConfirm) {
            if (isConfirm) {
                var id = payload._id;
                adminServices.deleteInspirationalData({
                    "id": id
                }).then(function(response) {
                    if (response.status == 200) {
                        swal("Deleted!", "success");
                        $state.reload();

                    } else {
                        swal("Can't Delete!", "Unsuccess");
                        $state.reload();
                    }
                })
            } else {
                swal("Cancelled", "Page can't be remove)");
            }
        });
    }

    $scope.getInspirationalData = function() {
        var id = $stateParams.id;
        $scope.obj.loading = true;
        adminServices.getInspirationalData({
            "id": id
        }).then(function(response) {
            $scope.obj.loading = false;
            $scope.inspirational.name = response.data.name;
            $scope.inspirational._id = response.data._id;
            $scope.inspirational.image = response.data.image;
        }, function(error) {
            $scope.obj.loading = false;
            toastr.error("Error retrieving data.");
        })
    }

    $scope.updateInspirationData = function(payload) {
        $scope.obj.loading = true;
        adminServices.updateInspirationData(payload).then(function(response) {
            if (response) {
                $scope.obj.loading = false;
                toastr.success("Updated Successfully.");
                $state.go('admin.list_inspirational');
            }
        }, function(error) {
            $scope.obj.loading = false;
            toastr.error("Error updating details");
        })
    }

    // Called when the editor is completely ready.
    $scope.onReady = function() {

    };

    $scope.submit = function(data) {
        if (data.id) {
            if (data.content == "") {
                $scope.descErr = true;
                return;
            }
            $scope.obj.loading = true;
            adminServices.updateTemplate(data).then(function(response) {
                if (response) {
                    $scope.obj.loading = false;
                    $state.go('admin.managePages');
                }
            }, function(error) {
                $scope.obj.loading = true;
            })
        } else {
            if (data.content == "") {
                $scope.descErr = true;
                return;
            }
            $scope.obj.loading = true;
            adminServices.submitTemplate(data).then(function(response) {
                if (response) {
                    $scope.obj.loading = false;
                    $state.go('admin.managePages');
                }
            }, function(error) {
                $scope.obj.loading = true;
            })
        }

    }



    $scope.getAllPages = function(search) {
        var passingData = {};
        if (search) {
            passingData.search = $scope.searchPage;
        } else {
            passingData.search = '';
        }
        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 10,
        }, {
            counts: [],
            getData: function($defer, params) {
                passingData.page = params.page();
                passingData.count = params.count();
                passingData.sort = params.sorting();

                adminServices.getAllPages(passingData).then(function(response) {
                    if (response) {
                        params.total(response.data.count);
                        $scope.data = response.data.data;
                        $scope.skipNo = response.data.skipNo;
                        $defer.resolve($scope.data);
                    }

                })
            }
        })
    }

    $scope.editPageContent = function(pageData) {
        var id = $stateParams.id;
        adminServices.getPageData({
            "id": id
        }).then(function(response) {
            $scope.obj.id = response.data._id;
            $scope.obj.title = response.data.title;
            $scope.obj.content = response.data.content
            $scope.obj.seoTitle = response.data.seoTitle;
            $scope.obj.seoDescription = response.data.seoDescription;
        }, function(error) {

        })
    }

    $scope.deletePageContent = function(pageData) {
        swal({
            title: "Do you want to delete this page from list",
            text: "Click OK to delete Page",
            type: "info",
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, function(isConfirm) {
            if (isConfirm) {
                var id = pageData._id;
                adminServices.deletePageData({
                    "id": id
                }).then(function(response) {
                    if (response.status == 200) {
                        swal("Deleted!", "success");
                        $state.reload();

                    } else {
                        swal("Can't Delete!", "Unsuccess");
                        $state.reload();
                    }
                })
            } else {
                swal("Cancelled", "Page can't be remove)");
            }
        });
    }

    $scope.login = function(values) {
        adminServices.signIn(values).then(function(response) {
            if (response.status == 200) {
                $localStorage.authorizationToken = response.access_token;
                $localStorage.username = response.username;
                $state.go('admin.dashboard');
            } else {
                console.log(response.data.message);
            }
        })

    }


    $scope.logout = function() {
        $localStorage.$reset();
        $rootScope.loggedInUser = false;
        $rootScope.loggedInUserType = false;
        $rootScope.userLoggedIn = false;
        $state.go('access.login');
    }


    $scope.pageChanged = function() {
        $scope.loaderStart = true;
        var passingObj = {}
        passingObj.search = $scope.myobj.search;
        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 10,
            sorting: {
                email: "desc"
            }
        }, {
            counts: [1, 2, 5, 10],
            getData: function($defer, params) {
                passingObj.page = params.page();
                passingObj.count = params.count();
                passingObj.sort = params.sorting();
                adminServices.getallUsers(passingObj).then(function(response) {
                    $scope.data = response.data.data;
                    params.total(response.data.count);
                    $defer.resolve($scope.data);
                    $scope.loaderStart = false;
                }).catch(function(result) {
                    $scope.messages = result.data.msg
                    $scope.loaderStart = false;
                })
            }
        })
    }

    $scope.undelete = function(userid) {
        $scope.userid = userid;
    }

    $scope.delete = function(userid) {
        $scope.userid = userid;

    }

    $scope.confirmdelete = function() {
        $scope.loaderStart = true;
        adminServices.deleteuser($scope.userid).then(function(response) {
            $scope.pageChanged();
            $scope.loaderStart = false;
        }).catch(function(result) {
            $scope.messages = result.data.msg
        })
    }

    $scope.confirmundelete = function() {
        $scope.loaderStart = true;
        adminServices.undeleteuser($scope.userid).then(function(response) {
            $scope.pageChanged();
            $scope.loaderStart = false;
        }).catch(function(result) {
            $scope.messages = result.data.msg
        })
    }

    $scope.orderspage = function() {
        var passingObj = {}
        passingObj.search = $scope.myobj.search;
        passingObj.start_Date = $scope.myobj.startDate
        passingObj.end_Date = $scope.myobj.endDate;
        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 10,
            sorting: {
                createdOn: "desc"
            }
        }, {
            counts: [1, 2, 5, 10],
            getData: function($defer, params) {
                passingObj.page = params.page();
                passingObj.count = params.count();
                passingObj.sort = params.sorting();
                adminServices.getallOrders(passingObj).then(function(response) {
                    $scope.data = response.data.data;
                    params.total(response.data.count);
                    $defer.resolve($scope.data);
                }).catch(function(result) {
                    $scope.messages = result.data.msg
                })
            }
        })
    }



    $scope.userorderspage = function() {
        var passingObj = {}
        passingObj.id = $stateParams.id;
        passingObj.search = $scope.myobj.search;
        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 10,
            sorting: {
                createdOn: "desc"
            }
        }, {
            counts: [1, 2, 5, 10],
            getData: function($defer, params) {
                passingObj.page = params.page();
                passingObj.count = params.count();
                passingObj.sort = params.sorting();
                adminServices.getallUserOrders(passingObj).then(function(response) {
                    $scope.data = response.data.data;
                    params.total(response.data.count);
                    $defer.resolve($scope.data);
                }).catch(function(result) {
                    $scope.messages = result.data.msg
                })
            }
        })
    }


    $scope.orderdetail = function() {
        adminServices.getOrderDetail($stateParams.id).then(function(response) {
            $rootScope.imgpath = response.data.imgPath;
            $rootScope.orders = response.data.data[0]
        }).catch(function(result) {
            $scope.messages = result.data.msg
        })

    }

    $scope.userorderdetail = function() {
        adminServices.getUserOrderDetail($stateParams.id).then(function(response) {
            $scope.imgpath = response.data.imgPath;
            $scope.userorders = response.data;
        }).catch(function(result) {
            $scope.messages = result.data.msg
        })
    }

    $scope.userDetails = function() {
        adminServices.getUserDetail($stateParams.id).then(function(response) {
            $rootScope.userDetail = response.data.data[0];
        }).catch(function(result) {
            $scope.messages = result.data.msg
        })
    }

    $scope.saveOrderStatus = function(data) {
        adminServices.saveOrderStatus(data).then(function(response) {
            if (response) {
                toastr.success("Order Status updated successfully.");

            }
        }, function(error) {
            toastr.error("Error updating status.");
        })
    }

    $scope.getDetails = function() {
        var id = $stateParams.id;
        adminServices.getDetails({
            "id": id
        }).then(function(response) {
            $scope.shipping = response.data.shippingAddress;
            $scope.billing = response.data.billingAddress;
            $scope.pack = response.data.packagingAddress;
            $scope.details.email = response.data.email;
            $scope.details.id = response.data._id;
        }, function(error) {
            console.log("error", error);
        })
    }

    $scope.updateUserDetails = function(a, b, c, d) {
        $scope.obj.loading = true;
        var info = {};
        info.user_details = a;
        info.shipping_details = b;
        info.billing_details = c;
        info.packaging_details = d;
        adminServices.updateUserDetails({
            "info": info
        }).then(function(response) {
            $scope.obj.loading = false;
            $state.go('admin.listOrders');
        }, function(error) {
            toastr.error("Error updating details");
        })
    }

    $scope.submitETA = function(days) {
        $scope.obj.loading = true;
        if (days.id) {
            adminServices.updateETA({
                "days": days
            }).then(function(response) {
                if (response) {
                    $scope.obj.loading = false;
                    toastr.success("Days added successfully");
                }
            }, function(error) {
                if (error) {
                    toastr.error("Error updating days");
                }
            })
        } else {
            adminServices.addETA({
                "days": days
            }).then(function(response) {
                if (response) {
                     $scope.obj.loading = false;
                    toastr.success("Days added successfully");
                }
            }, function(error) {
                if (error) {
                    toastr.error("Error updating days");
                }
            })
        }

    }

    $scope.getCheckoutDetails = function() {
        adminServices.getCheckoutDetails().then(function(response) {
            $scope.days.estimatedDays = response.data.estimatedDays;
            $scope.days.id = response.data._id;
        }, function(error) {

        })
    }



    $scope.submitDelivery = function(charges) {
        $scope.obj.loading = true;
        if (charges.id) {
            adminServices.updateDelivery({
                "deliveryCharges": charges
            }).then(function(response) {
                if (response) {
                    $scope.obj.loading = false;
                    toastr.success("Express Delivery added successfully");
                }
            }, function(error) {
                if (error) {
                    toastr.error("Error updating Express Delivery");
                }
            })
        } 
        else {
            adminServices.addDelivery({
                "deliveryCharges": charges.expressDelivery
            }).then(function(response) {
                if (response) {
                     $scope.obj.loading = false;
                    toastr.success("EXpress Delivery added successfully");
                }
            }, function(error) {
                if (error) {
                    toastr.error("Error updating Express Delivery");
                }
            })
        }
    }
    


    $scope.getDeliveryDetails = function() {
        adminServices.getDeliveryDetails().then(function(response) {
            $scope.charge.expressDelivery = response.data.deliveryCharges;
            $scope.charge.id = response.data._id;
        }, function(error) {

        })
    }




    $scope.exportOrderCSV = function()
    {
      adminServices.exportOrderCSV().then(function(response) {
            var b = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(b,"orders.xlsx");//this is FileSaver.js function
      });
    }

    $scope.exportUserCSV = function()
    {
      adminServices.exportUserCSV().then(function(response) {
            var b = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(b,"users.xlsx");//this is FileSaver.js function
      });
    }



    //uib Date Picker Options

	$scope.dateOptions = {
		formatYear: 'yy',
		maxDate: new Date(2030, 5, 22),
		// minDate: new Date(),
		startingDay: 1
	};


	$scope.open1 = function() {
		$scope.popup1.opened = true;
	};

	$scope.open2 = function() {
		$scope.popup2.opened = true;
	};

	$scope.setDate = function(year, month, day) {
		$scope.dt = new Date(year, month, day);
	};

	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	$scope.format = $scope.formats[0];
	$scope.altInputFormats = ['M!/d!/yyyy'];

	$scope.popup1 = {
		opened: false
	};

	$scope.popup2 = {
		opened: false
	};

	var tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	var afterTomorrow = new Date();
	afterTomorrow.setDate(tomorrow.getDate() + 1);
	$scope.events = [{
		date: tomorrow,
		status: 'full'
	}, {
		date: afterTomorrow,
		status: 'partially'
	}];

    //END
    


    
}); 
