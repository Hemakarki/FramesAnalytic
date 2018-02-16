framebridge.controller('detailFrameController', function($scope, $state, $stateParams, detailFramesServices) {


    $scope.state = $state.current
    $scope.params = {};
    $scope.params._id = $stateParams.foo;
    $scope.detailFrames = function()
    {
      detailFramesServices.detailFrames($scope.params).then(function(response) {
        if(response.data.status == 200) {
          $scope.frameDeatils = response.data.frameData;
        }
        else {
          console.log(response.data.message);
        }
      })
    }
});
