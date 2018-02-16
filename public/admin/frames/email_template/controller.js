framebridge.controller('emailTemplateController', 
	function($scope, $http, toastr, $rootScope, $state, $stateParams, emailService, $localStorage, ngTableParams) {
     $scope.obj = {};
     $scope.myobj = {};
     $scope.myobj.currentPage = 1;
    if($localStorage.userLoggedIn) {
		$rootScope.userLoggedIn = true;
		$rootScope.loggedInUser = $localStorage.loggedInUsername;
	}
	else {
		$rootScope.userLoggedIn = false;
	}

	
	if($rootScope.message != "") {

		$scope.message = $rootScope.message;
	}

	//empty the $scope.message so the field gets reset once the message is displayed.
	$scope.message = "";
	$scope.activeTab = 0;
	$scope.user = {first_name: "", last_name: "", user_name: "", password: "", email: "", display_name: "", role: []}

	//Toggle multilpe checkbox selection
	$scope.selection = [];
	$scope.selectionAll;
	$scope.toggleSelection = function toggleSelection(id) {
			//Check for single checkbox selection
			if(id){
				var idx = $scope.selection.indexOf(id);
	            // is currently selected
	            if (idx > -1) {
	            	$scope.selection.splice(idx, 1);
	            }
	            // is newly selected
	            else {
	            	$scope.selection.push(id);
	            }
	        }
	        //Check for all checkbox selection
	        else{
	        	//Check for all checked checkbox for uncheck
	        	if($scope.selection.length > 0 && $scope.selectionAll){
	        		$scope.selection = [];
	        		$scope.checkboxes = {
	        			checked: false,
	        			items:{}
	        		};	
	        		$scope.selectionAll = false;
	        	}
	        	//Check for all un checked checkbox for check
	        	else{
	        		$scope.selectionAll = true
	        		$scope.selection = [];
	        		angular.forEach($scope.simpleList, function(item) {
	        			$scope.checkboxes.items[item._id] = $scope.checkboxes.checked;
	        			$scope.selection.push(item._id);
	        		});
	        	}
	        }
	       
	    };


    	//apply global Search
    	$scope.applyGlobalSearch = function() {
    		var term = $scope.globalSearchTerm;
    		if(term != "") {
    			if($scope.isInvertedSearch) {
    				term = "!" + term;
    			}
    			$scope.tableParams.filter({$ : term});
    			$scope.tableParams.reload();			
    		}search
    	}


    	$scope.listTemplates = function() {
	         $scope.loaderStart = true;
		        var passingObj = {}
		        passingObj.search = $scope.myobj.search;
		        $scope.tableParams = new ngTableParams({
		            page: 1,
		            count: 10,
		            sorting: {
		                title: "desc"
		            }
		        }, {
	            counts: [1, 2, 5, 10],
	            getData: function($defer, params) {
	                passingObj.page = params.page();
	                passingObj.count = params.count();
	                passingObj.sort = params.sorting();
	                emailService.listTemplate(passingObj).then(function(response) {
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

		$scope.addTemplate = function(template) { 
	        $scope.obj.loading = true;
	        emailService.submitEmailTemplate(template).then(function(response) {
	            if (response) {
	                $scope.obj.loading = false;
	                toastr.success("Email Template added successfully!");
	                $state.go('admin.listTemplates');
	            }
	        }, function(error) {
	            $scope.obj.loading = false;
	            toastr.error("Error adding email template!");
	        });
	    } 
		 
		
		$scope.updateTemplate = function (data) {
			$scope.obj.loading = true;
            if ($scope) {
				emailService.updateTemplate(data).then(function(response) {
					if(response.status == 200) {
				        toastr.success("Email Template edited successfully!");
				        $state.go('admin.listTemplates');
					} else{
						$scope.obj.loading = false;
	            		toastr.error("Error editing email template!");
					}
				});
			}
		}

		$scope.getTemplate = function() {
	        var id = $stateParams.id;
	        $scope.obj.loading = true;
	        $scope.template = {}
	        emailService.getTemplate({
	            "id": id
	        }).then(function(response) {//response = JSON.stringify(response.data);
	            $scope.obj.loading = false;
	            $scope.template.title = response.data.title;
	            $scope.template.content = response.data.content;
	            $scope.template._id = response.data._id;
	        }, function(error) {
	            $scope.obj.loading = false;
	            toastr.error("Error retrieving data.");
	        })
	    }

	    $scope.onReady = function(){
	    	console.log("$scope.template.content");
	    }
	});
	