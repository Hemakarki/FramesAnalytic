framebridge.controller('instagramController', function($scope, $state, $http, $rootScope, instagramService) {
  $scope.instaImages = [];
  $scope.visibility1 = true;
  $scope.visibility2 = true;


  $scope.userMedia = function() {

    var endpoint = "https://api.instagram.com/v1/users/self/media/recent/";
    endpoint += "?access_token=4965055613.2f4a3c2.7ebf668469224f4ca6f0f6217ebf5a8b";
    // endpoint += "?access_token="+access_token;
    endpoint += "&callback=JSON_CALLBACK";



    $http.jsonp(endpoint).then(function(response) {
      var instaData = JSON.stringify(response.data.data);
      instaData = JSON.parse(instaData);
      for (var i = 0; i < instaData.length; i++) {
        var images = instaData[i].images;
        $scope.instaImages.push(images);
      }
    });
  }

  $scope.getToken = function(){
    instagramService.getToken().then(function success(response) {
      console.log(response.data,"here");
    });
  };

  $scope.imageClicked = function(index) {
    var imageData = $scope.instaImages[index];
    $state.go('user.editImage', {
      myParam: imageData
    });
  }

});