'use strict';

angular.module('DBDG').controller('lookupsettingCtrl', function ($rootScope, APIs, $filter, $scope, $location, $cookies, authFactory) {

    /* Create New Lookup Form Hide and Show */
    $scope.createNewLookup = function () {
        $scope.hideListView = true;
        $scope.LdName = '';
        $scope.LmId = '';
        $scope.LdDesc = '';
        $scope.ParentId = '';
        $scope.status = 0;
        $scope.createLabel = "Create New Lookup";
        $scope.buttonName = "Save";
        $scope.submitted = false;
    };
    
    $scope.cancelCreateNewLookup = function () {
        var cancelConfirmation = confirm('Are you sure you want to cancel?');
        if (cancelConfirmation == true) {
            $scope.hideListView = false;
        }
    };

    /*Validation*/
    $scope.submitted = false;
    $scope.enableSaveBtn = true;

    /*Get All LookUpDetails*/
    $scope.getLookUpDetails = function () {
        APIs.getLookUpDetails().success(function (data, status) {
            $scope.lookUpLists = data.LookUpDetails;
            $scope.totalRowCount = data.TotalRowCount;
            $scope.lookUpParentList = data.LookUpParentList;
            $scope.lookUpMastersList = data.LookUpMastersList;
            $scope.lookUpStatus = [{
                "Id": 0,
                "Value": "Active"
            }, {
                "Id": 1,
                "Value": "Deactive"
            }];
        }).error(function (data, status) {
            console.log(data)
        });
    };


    /*Save Lookup*/
    $scope.saveLookup = function (id) {
        $scope.submitted = true;
        var LookupDetail = {
            'LdId': id,
            'LdName': $scope.LdName,
            'LmId': $scope.LmId,
            'LdDesc': $scope.LdDesc,
            'ParentId': $scope.ParentId || 0,
            'IsActive': $scope.status,
            'CreatedBy': parseInt($cookies.get('Id'))
        }
        if (!$scope.createLookupForm.$invalid) {
            APIs.saveLookupDetail(LookupDetail).success(function (data, status) {
                    if (LookupDetail.LdId == undefined || null) {
                        $scope.isDisabled = true;
                        $scope.notificationAlert("Lookup added successfully");
                        $scope.hideListView = false;
                        LookupDetail.LdId = parseInt(data);
                        $scope.lookUpLists.push(LookupDetail);                        
                        $scope.totalRowCount = $scope.totalRowCount + 1;
                    } else {
                        $scope.isDisabled = true;
                        $scope.notificationAlert("Lookup updated successfully");
                        var objIndex = _.findIndex($scope.lookUpLists, {
                            Id: parseInt(data)
                        });

                        var lookUpName = _.where($scope.lookUpMastersList, {
                            Id: LookupDetail.LmId
                        });
                        if (lookUpName.length > 0) {
                            $scope.lookUpLists[objIndex].LookUpName = lookUpName[0].Value;
                        }

                        var lookUpParentName = _.where($scope.lookUpParentList, {
                            Id: $scope.ParentId
                        });
                        if (lookUpParentName.length > 0) {
                            $scope.lookUpLists[objIndex].ParentName = lookUpParentName[0].Value;
                        } else {
                            $scope.lookUpLists[objIndex].ParentName = '';
                        }
                        $scope.lookUpLists[objIndex].DetailName = LookupDetail.LdName;
                        $scope.lookUpLists[objIndex].Id = LookupDetail.LdId;
                        $scope.lookUpLists[objIndex].IsActive = LookupDetail.IsActive;
                        $scope.lookUpLists[objIndex].LdDesc = LookupDetail.LdDesc;
                        $scope.lookUpLists[objIndex].LookUpId = LookupDetail.LmId;
                        $scope.lookUpLists[objIndex].ModifiedBy = parseInt($cookies.get('Id'));
                        $scope.lookUpLists[objIndex].ParentId = $scope.ParentId;
                        $scope.hideListView = false;
                    }
                })
                .error(function (data, status) {
                    console.log(data);
                });
        }
    };

    /* Edit Lookup */
    $scope.editLookup = function (index) {
        $scope.createLabel = "Edit Lookup";
        $scope.buttonName = "Update Changes";
        $scope.submitted = false;
        $scope.hideListView = true;
        $scope.LdName = $scope.lookUpLists[index].DetailName;
        $scope.ParentId = $scope.lookUpLists[index].ParentId;
        $scope.LmId = $scope.lookUpLists[index].LookUpId;
        $scope.status = $scope.lookUpLists[index].IsActive;
        $scope.LdDesc = $scope.lookUpLists[index].LdDesc;
        $scope.LookupDetailId = $scope.lookUpLists[index].Id;        
        $scope.originalData = angular.copy($scope.lookUpLists[index]);
        $scope.editIndex = index;
    };

    /*Watch Builder*/
    $scope.watchLookupChange = function () {
        $scope.enableSaveBtn = false;
    };

    /* Sorting function */
    $scope.sortBy = function (field) {
        var orderBy;
        if ($scope.sortReverse === true) {
            orderBy = field;
        } else {
            orderBy = '-' + field;
        }
        $scope.lookUpLists = $filter('orderBy')($scope.lookUpLists, orderBy);
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
        getLookupDetailsByPage(data);
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pageCount()) {
            $scope.currentPage++;
        }

        var data = {
            PageCount: $scope.currentPage,
            Limit: $scope.itemsPerPage || 10
        };
        getLookupDetailsByPage(data);
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
        getLookupDetailsByPage(data);

    };

    function getLookupDetailsByPage(data) {
        APIs.getLookupDetailsByPaging(data).success(function (data, status) {
            $scope.lookUpLists = data;
        }).error(function (data, status) {
            console.log(data);
        });
    }

});