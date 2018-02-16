framebridge.controller('seoController', function($scope, seoService, toastr, $stateParams,$state) {
    $scope.obj = {};
	$scope.addSEO = function(payload) {
		$scope.obj.loading = true;
		var id = payload._id;
		if (id) {
			seoService.updateSEO(payload).then(function(response) {
				if (response) {
					$scope.obj.loading = false;
					toastr.success("SEO Values saved successfully.");
				}
			}, function(error) {
				$scope.obj.loading = false;
				toastr.error("Error adding SEO.");
			})

		} else {
			seoService.addSEO(payload).then(function(response) {
				if (response) {
					$scope.obj.loading = false;
					toastr.success("SEO Values saved successfully.");
				}
			}, function(error) {
				$scope.obj.loading = false;
				toastr.error("Error adding SEO.");
			})
		}

	}

	$scope.listSEO = function() {
		$scope.obj.loading = true;
		seoService.listSEO().then(function(response) {
			if (response) {
				$scope.obj.loading = false;
				$scope.data = response.data;
			}
		}, function(error) {

		})
	}

	$scope.getSEOValue = function() {
		$scope.obj.loading = true;
		var id = $stateParams.id;
		seoService.getSEOValue({
			"id": id
		}).then(function(response) {
			if (response) {

				$scope.obj.loading = false;
				$scope.seo = response.data;
			}
		}, function(error) {

		})
	}

	$scope.updateSEO = function(data) {
		$scope.obj.loading = true;
		seoService.updateSEO({
			"data": data
		}).then(function(response) {
           if(response){
           	$scope.obj.loading = false;
             $state.go('admin.list_seo');

           }
		}, function(error) {

		})
	}



})