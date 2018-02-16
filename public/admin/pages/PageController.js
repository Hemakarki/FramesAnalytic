framebridge.controller('PageController', function($scope,$stateParams,PageService) {
    $scope.getstartFramingContent = function() {
		var pageCode = $stateParams.page;

		PageService.getstartFramingContent({"pageCode":pageCode}).then(function(result) {
			if (result) {
				 $scope.content = result.data[0].content;
			}
		}, function(error) {

		})
	}
	$scope.getstartFramingContent();
})