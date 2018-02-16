framebridge.controller('size_costController', function($scope, sizecostService, toastr, $stateParams,$state) {
    $scope.obj = {};
    var isEdit = false;

    $scope.getSizeCost = function() {
        $scope.obj.loading = true;
        sizecostService.getSizeCost().then(function success(response) {
            $scope.sizecost = response.data.sizecostData;
            // toastr.success("Update successfully");
            $scope.obj.loading = false;
        }, function error(response) {
            toastr.error("Can't get sizes");
            $scope.obj.loading = false;
        });
    }


    $scope.updateSize = function(sizes) {
        $scope.obj.loading = true;        
        sizecostService.updateSizeCost(sizes).then(function success(response) {
            $state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
            toastr.success("Update successfully");
            $scope.obj.loading = false;
        }, function error(response) {
            toastr.error("Can't update");
            $scope.obj.loading = false;
        });
    }

});