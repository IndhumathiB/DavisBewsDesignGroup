'use strict';

angular.module('DBDG').controller('dashboardCtrl', function ($rootScope, APIs, $scope, $filter, $location,$timeout, $cookies, authFactory) {
    
   
  /*Get All Dashboard Details*/
    $scope.getDashBoardsDetails = function (pageCount) {
         if(pageCount == 0){
           $scope.currentPage = 1; 
        }
        var data={
                "BuilderId":$scope.builderNames || 0,
                "Limit":$scope.itemsPerPage || 10,
                "PageCount":$scope.currentPage-1,
                "Percentage":$scope.percentage || 0,
                "UserId":parseInt($cookies.get('Id')),
                "RoleId": parseInt($cookies.get('Role'))
                }
        APIs.getDashBoardsDetailsByFilter(data).success(function (data, status) {            
            $scope.dashBoardList = data.DashBoardList; 
            $scope.totalRowCount = data.TotalCount;
            $scope.builderList = data.BuilderList;
            $scope.percentages = data.Percentage;
        }).error(function (data, status) {
            console.log(data)
        });
    };  
     
    //Reset Filter
     $scope.resetFilterValues = function () {
            $scope.builderNames = 0;
            $scope.itemsPerPage = 10;
            $scope.currentPage = 1;
            $scope.percentage = 0;
            $scope.getDashBoardsDetails();
        };
    
    /* Get list of uplaoded files */
    $scope.getAllFilesList = function (permitsId) {
        var data = {
            permitId: permitsId
        };

        APIs.getPemitsFiles(data).success(function (data, status) {
            $scope.listOfFiles = data;
            $scope.currentPermitId = permitsId;
        }).error(function (data, status) {
            console.log(data);
        });
    };
    
    /* Watch File Upload functionality */
    $scope.multipleFiles = [];

    $scope.$watch(function () {
        return $scope.myFile;
    }, function (newValue) {
        if (newValue) {
            $scope.multipleFiles.push($scope.myFile);
        }
    });

    $scope.uploadFile = function (permitFileId) {
        /*
         * permitFileId - get value from getfileList function $scope.currentPermitId
         */
        var currentId = permitFileId;
        var filesList = $scope.multipleFiles;
        var numberOfFiles = $scope.multipleFiles.length;
        var i = 0;
        if (numberOfFiles > 0) {
            var fd = new FormData();
            fd.append('file', filesList[i]);
            APIs.pemitsFileUpload(fd, currentId).success(function (data, status) {
                $scope.listOfFiles.push(data);
                $scope.notificationAlert(filesList[i].name + " uploaded successfully");
                angular.element(document.querySelector('#fileID')).val('');
                $timeout(function () {
                    $scope.multipleFiles.splice(i, 1);
                    $scope.uploadFile(currentId);
                }, 1000);
            }).error(function (data, status) {
                console.log(data);
            });
        }
    };

    $scope.cancelFileUpload = function (index) {
        angular.element(document.querySelector('#fileID')).val('');
        if (index == 'deleteAll') {
            $scope.multipleFiles = [];
        } else {
            $scope.multipleFiles.splice(index, 1);
        }
    };
    
    
    /* Sorting function */
    $scope.sortBy = function (field) {
        var orderBy;
        if ($scope.sortReverse == true) {
            orderBy = field;
        } else {
            orderBy = '-' + field;
        }
        $scope.dashBoardList = $filter('orderBy')($scope.dashBoardList, orderBy);
    };
    
    
    
    /* Instead of Jquery use angular for dom manupulation */
    $scope.callSCrollBar = function () {
        $timeout(function () {
            $scope.tableWidth = $(".table-responsive.cus-cards").width();
        }, 500);

    };

    /*calling scroll bar function from basecontroller*/
    //$scope.scrollBar();
    
    function scrollBar() {
        $scope.tableWidth = $(".table-responsive.cus-cards").width();
        $(".cus-scroll-container").scroll(function () {
            $(".table-responsive.cus-cards").scrollLeft($(".cus-scroll-container").scrollLeft());
        });
        $(".table-responsive cus-cards").scroll(function () {
            $(".cus-scroll-container").scrollLeft($(".table-responsive.cus-cards").scrollLeft());
        });
    }
    scrollBar();
    
    jQuery(window).trigger('resizeWindow');
    /* Pagination function */
    $scope.itemsPerPage =10;
    $scope.currentPage = 1;

    $scope.range = function () {
        var pageNumber = [];
        var start;

        var rangeSize;
        if ($scope.pageCount() < 4) {
            rangeSize = $scope.pageCount();
        } else {
            rangeSize = 4;
        }

        start = $scope.currentPage;
        if (start > $scope.pageCount() - rangeSize) {
            start = $scope.pageCount() - rangeSize + 1;
        }

        for (var i = start; i < start + rangeSize; i++) {
            pageNumber.push(i);
        }
        return pageNumber;
    };

     $scope.prevPage = function () {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
        }
        
        var data={
                "BuilderId":$scope.builderNames || 0,
                "Limit":$scope.itemsPerPage || 10,
                "PageCount":$scope.currentPage,
                "Percentage":$scope.percentage || 0,
                "UserId":parseInt($cookies.get('Id')),
                "RoleId":parseInt($cookies.get('Role'))
                };
        $scope.getDashBoardsDetails(data);
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pageCount()) {
            $scope.currentPage++;
        }

       var data={
                "BuilderId":$scope.builderNames || 0,
                "Limit":$scope.itemsPerPage || 10,
                "PageCount":$scope.currentPage,
                "Percentage":$scope.percentage || 0,
                "UserId":parseInt($cookies.get('Id')),
                "RoleId":parseInt($cookies.get('Role'))
                };
        $scope.getDashBoardsDetails(data);
    };

    $scope.pageCount = function () {
        return Math.ceil($scope.totalRowCount / $scope.itemsPerPage);
    };

    $scope.setPage = function (n) {
        $scope.currentPage = n;
       var data={
                "BuilderId":$scope.builderNames || 0,
                "Limit":$scope.itemsPerPage || 10,
                "PageCount":$scope.currentPage,
                "Percentage":$scope.percentage || 0,
                "UserId":parseInt($cookies.get('Id')),
                "RoleId":parseInt($cookies.get('Role'))
                };
        $scope.getDashBoardsDetails(data);
    };

  
    
    
});