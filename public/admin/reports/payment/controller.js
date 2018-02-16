framebridge.controller('paymentReportController', function($scope,$state, toastr, paymentReportService, ngTableParams) { 
    $scope.myobj = {};

    $scope.PaymentReports = function() {
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
                paymentReportService.getPaymentReport(passingObj).then(function(response) {
                    $scope.data = response.data.data;
                    params.total(response.data.count);
                    $defer.resolve($scope.data);
                }).catch(function(result) {
                    $scope.messages = result.data.msg
                })
            }
        })
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