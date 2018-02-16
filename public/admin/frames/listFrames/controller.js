framebridge.controller('listFrameController', function($scope, $state, $filter, listFramesServices) {

  $scope.frameColor = function()

  {
    listFramesServices.getFrameColour().then(function(response) {
        if (response.data.status == 200) {
            $scope.frame = {};
            $scope.colors = response.data.frameColours;
        } else {
            $$state.go('admin.addFrames');
        }
    });
  }


  $scope.pagination = {
    perPage: 9,
    currentPage: 1,
    total: 0
  };
  $scope.getData = function(searchValue) {
     $scope.frameColor();
     var jsondata={};
     jsondata.pageno=$scope.pagination.currentPage;
     jsondata.itemsPerPage=$scope.pagination.perPage;
     jsondata.searchColor = searchValue;
     listFramesServices.frameList(jsondata).then(function(response) {
       if(response.data.status == 200) {
         $scope.frameList = response.data.frameData;
         $scope.pagination.total = response.data.count;
       }
       else {
         console.log(response.data.message);
       }
     })
  }

   $scope.pageChanged = function(newPage) {
     $scope.pagination.currentPage = newPage;
     $scope.getData();
   };



  $scope.deleteFrame = function(frameData) {
    $scope.frameData = {};
    $scope.frameData._id = frameData
    var redirect = function()
    {
      console.log("In redirect Function");
    }
    swal({
      title: "Do you want to delete this frame from list",
      text: "Click OK to delete Frame",
      type: "info",
      showCancelButton: true,
      closeOnConfirm: false,
      showLoaderOnConfirm: true
    }, function(isConfirm) {
        if (isConfirm) {
          listFramesServices.deleteFrame($scope.frameData).then(function(response) {
            if(response.data.status == 200) {
              swal("Deleted!", response.data.message, "success");
              $state.reload();

              }
            else {
              swal("Can't Delete!", response.data.message, "Unsuccess");
              $state.reload();
            }
          })
        }
        else {
          swal("Cancelled", "Frames can't be remove)", "error");
        }
      });
  }


  $scope.exportProductCSV = function()
  {
    listFramesServices.exportProductCSV().then(function(response) {
          var b = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
          saveAs(b,"frames.xlsx");//this is FileSaver.js function
    });
  }
  
  
});
