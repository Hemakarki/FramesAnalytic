framebridge.controller('promoCodeController', function($scope,$state, $http, toastr, promoService, ngTableParams, $stateParams) {
	$scope.obj = {};
	$scope.obj.loading = false;

	//Offer Type Array
	$scope.promo = {};
	$scope.offerType = [{
		"label": "Limited Offer",
		"value": "1"
	}, {
		"label": "Date Range Offer",
		"value": "2"

	}];
	//END	

	//uib Date Picker Options

	$scope.dateOptions = {
		formatYear: 'yy',
		maxDate: new Date(2020, 5, 22),
		minDate: new Date(),
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

	//Function to add PromoCode
	$scope.addPromoCode = function(payload) {
		var promo = payload.promoCode;
		payload.promoCode = promo.toLowerCase();
			$scope.obj.loading = true;
			promoService.addPromoCode(payload).then(function(response) {
				if (response) {
					$scope.obj.loading = false;
					$state.go('admin.list_promo_code');
				}
			}, function(error) {
				$scope.obj.loading = false;
				toastr.success("Error adding code!");
			})
		}
		//END

	//Function to get Promo Code Listing
	$scope.getPromoList = function(search) {
		var passingData = {};
		$scope.obj.loading = true;
		if (search) {
			passingData.search = $scope.searchPage;
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

				promoService.getPromoList(passingData).then(function(response) {

					if (response) {
						$scope.obj.loading = false;

						params.total(response.data.count);
						$scope.data = response.data.data;

						if ($scope.data.length == 0) {
							toastr.info("No Record To Display.");
						} else {
							toastr.success("Promo Code listed successfully.");
						}
						$scope.skipNo = response.data.skipNo;
						$defer.resolve($scope.data);
					}

				}, function(error) {
					$scope.obj.loading = false;
					toastr.error("Error retrieving Promo Code.");
				})
			}
		})
	};

	//Function to delete Promo Code
	$scope.deletePromoCode = function(data) {
		swal({
			title: "Do you want to delete the promo Code from list",
			text: "Click OK to delete Page",
			type: "info",
			showCancelButton: true,
			closeOnConfirm: false,
			showLoaderOnConfirm: true
		}, function(isConfirm) {
			if (isConfirm) {
				var id = data._id;
				promoService.deletePromoCode({
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

	//Function to edit Promo Code
	$scope.getPromoCodeDetails = function() {
		var id = $stateParams.id;
		$scope.obj.loading = true;
		promoService.getPromoCodeDetails({
			"id": id
		}).then(function(response) {
			if (response) {
				$scope.promo.promoCode = response.data.promoCode;
				$scope.promo.description = response.data.description;
				$scope.promo.offerType = response.data.offerType;
				$scope.promo.startDate = new Date(response.data.startDate);
				$scope.promo.endDate = new Date(response.data.endDate);
				$scope.promo.offerCount = response.data.offerCount;
				$scope.promo.discount = response.data.discount;
				$scope.promo.id = response.data._id;
				$scope.obj.loading = false;
			}
		}, function(error) {
			$scope.obj.loading = false;
			toastr.error("Error getting details");
		})
	}

	$scope.updatePromoCode = function(payload) {
		$scope.obj.loading = true;
		promoService.updatePromoCode(payload).then(function(response) {
			if (response) {
				$scope.obj.loading = false;
				$state.go('admin.list_promo_code');

			}
		}, function(error) {
			$scope.obj.loading = false;
			toastr.error("Error getting details");
		})
	}


});