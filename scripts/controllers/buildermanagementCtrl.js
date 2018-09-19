'use strict';

angular.module('DBDG').controller('buildermanagementCtrl', function ($rootScope, $scope, $location, $filter, $cookies, APIs, authFactory) {

    /* Create New Builder Form Hide and Show */
    $scope.createNewBuilder = function () {
        $scope.hideListView = true;
        $scope.builderManagement = {};
        $scope.createLabel="Create New Builder";
        $scope.buttonName="Save";
        $scope.submitted = false;
    };

    $scope.cancelCreateNewBuilder = function () {
        var cancelConfirmation = confirm('Are you sure you want to cancel?');
        if (cancelConfirmation == true) {
        $scope.hideListView = false;
        }        
    };

    /*Validation*/
    $scope.submitted = false;
    $scope.enableSaveBtn = true;
    
    /*Get All Builders List*/
    $scope.getAllBuilderManageMembers = function () {
        var data = {
            'PageCount': $scope.currentPage,
            'Limit': $scope.itemsPerPage
        }
        APIs.getAllBuilderManageMembers(data).success(function (data, status) {
            $scope.buildersList = data.BuilderList;
            $scope.totalRowCount = data.TotalRowCount;
        }).error(function (data, status) {
            console.log(data)
        });
    };
    
      
    
    /*Save Builder*/
    $scope.saveBuilder = function (id) {        
        $scope.submitted = true;
        $scope.builderManagement = {
            'Id': id,
            'BuilderName': $scope.builderManagement.BuilderName,
            'ContactName': $scope.builderManagement.ContactName,
            'ContactEmail': $scope.builderManagement.ContactEmail,
            'ContactPhone': $scope.builderManagement.ContactPhone,
            'ContactFax': '',
            'Address1': $scope.builderManagement.Address1,
            'Address2': '',
            'City': $scope.builderManagement.City,
            'State': $scope.builderManagement.State,
            'Zipcode': parseInt($scope.builderManagement.Zipcode),
            'Notes': $scope.builderManagement.Notes,
            'CreatedBy': parseInt($cookies.get('Id'))
        }
        if (!$scope.createBuilderForm.$invalid) {
            APIs.saveBuilder($scope.builderManagement).success(function (data, status) {
                    if ($scope.builderManagement.Id == undefined || null) {
                        $scope.enableSaveBtn = true;
                        $scope.notificationAlert("Builder added successfully");
                         $scope.hideListView = false;
                        $scope.builderManagement.Id = parseInt(data);
                        $scope.buildersList.push($scope.builderManagement);
                        $scope.totalRowCount = $scope.totalRowCount + 1;
                    } else {
                         $scope.enableSaveBtn = true;
                        $scope.notificationAlert("Builder updated successfully");
                        var objIndex = _.findIndex($scope.buildersList, {
                            Id: parseInt(data)
                        });
                        $scope.buildersList[objIndex] = $scope.builderManagement;
                        $scope.hideListView = false;
                    }

                })
                .error(function (data, status) {
                    console.log(data);
                });
        }
    };


    /*EditBuilder*/
    $scope.editBuilder = function (id, Index) {
        $scope.buttonName="Update Changes";
        $scope.createLabel="Edit Builder";
        $scope.editId = id;
        $scope.submitted = false;
        $rootScope.INdex = Index;
        $scope.hideListView = true;
        var data = {
            id: $scope.editId
        }
        APIs.getBuilderById(data).success(function (data, status) {
            $scope.builderManagement = data;
            $scope.originalData=angular.copy(data);
        }).error(function (data, status) {
            console.log(data);
        });
    };
    
     /*Watch Builder*/
       $scope.watchBuilderChange = function () {
            $scope.enableSaveBtn = angular.equals($scope.originalData, $scope.builderManagement);
        };

    /*Delete Builder*/
    $scope.deleteBuilder = function (index) {
        var data = {
            id: $scope.buildersList[index].Id
        }
        var deleteConfirmation = confirm('Are you sure you want to delete?');
        if (deleteConfirmation == true) {
            APIs.deleteBuilder(data).success(function (data, status) {
                $scope.buildersList.splice(index, 1);
                $scope.notificationAlert(data);
                 if ($scope.buildersList.length === 0) {                      
                   var data = {
                        PageCount: $scope.currentPage = $scope.currentPage-1,
                        Limit: $scope.itemsPerPage || 10
                       };
                     $scope.getAllBuilderManageMembers(data);
                    }
            }).error(function (data, status) {
                //$scope.notificationAlert(data);
                console.log(data);
            });
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
        $scope.buildersList = $filter('orderBy')($scope.buildersList, orderBy);
    };


    /* Pagination function */
    $scope.itemsPerPage = 10;
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
        var data = {
            PageCount: $scope.currentPage,
            Limit: $scope.itemsPerPage || 10
        };
        $scope.getAllBuilderManageMembers(data);
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pageCount()) {
            $scope.currentPage++;
        }

        var data = {
            PageCount: $scope.currentPage,
            Limit: $scope.itemsPerPage || 10
        };
        $scope.getAllBuilderManageMembers(data);
    };

    $scope.pageCount = function () {
        return Math.ceil($scope.totalRowCount / $scope.itemsPerPage);
    };

    $scope.setPage = function (n) {
        $scope.currentPage = n;
        var data = {
            PageCount: $scope.currentPage,
            Limit: $scope.itemsPerPage || 10
        };
        $scope.getAllBuilderManageMembers(data);

    };



});