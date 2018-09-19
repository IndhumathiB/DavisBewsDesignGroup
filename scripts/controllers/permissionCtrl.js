'use strict';

angular.module('DBDG').controller('permissionCtrl', function ($scope, $rootScope, $location, $cookies, APIs, authFactory) {

    $scope.enableSaveButton = true;
    //$scope.enableUserList = true;
    $scope.startSpinner = false;

    /* Landing API with filter values */

    $scope.getPermissionFilters = function () {
        APIs.GetPermissionFilters().success(function (data, status) {
            $scope.permissionBuildersList = data.Builders;
            $scope.CommunityList = data.Community;
            $scope.MunicipalityList = data.Municipality;
        }).error(function (data, status) {
            console.log(data);
        })
    };

    /* Fetch Builder Contact list based on the the Builder Id */

    $scope.changePermissionBulderId = function () {
        $scope.startSpinner = true;
        var builderId = {
            id: $scope.permissionBuildId
        };
        APIs.getMembersByBuilder(builderId).success(function (data, status) {
            $scope.permissionBasedUserList = data;
            $scope.startSpinner = false;
        }).error(function (data, status) {
            console.log(data);
        });
    };

    /* Reset the filter value */

    $scope.resetPermitsFilter = function () {
        $scope.permissionBuildId = '';
        $scope.permissionMunicipId = '';
        $scope.permissionCommunityId = '';
        $scope.permissionUserId = '';
        $scope.permissionBasedUserList = '';
        $scope.permitPermissionList = '';
    };


    /* Get the permit permission list based on the filter value */

    $scope.applyPermissionFilter = function (newPage) {
        if (newPage == 0) {
            $scope.currentPage = 1;
        }

        var datas = {
            FilterDefinition: {
                BuilderId: $scope.permissionBuildId,
                BuidlerUserId: $scope.permissionUserId ? $scope.permissionUserId : '',
                CommunityId: $scope.permissionCommunityId ? $scope.permissionCommunityId : '',
                MunicipalityId: $scope.permissionMunicipId ? $scope.permissionMunicipId : '',
            },
            PageCount: $scope.currentPage - 1,
            Limit: $scope.itemsPerPage
        };

        if ($scope.permissionBuildId) {
            APIs.getPermitPermissionByPagination(datas).success(function (data, status) {
                $scope.permitPermissionList = data.PermitPermissions;
                $scope.dataAfterChange = angular.copy(data.PermitPermissions);
                //$scope.TotalCount = data.TotalCount;
                $scope.TotalCount = 9;
                $scope.originalData = angular.copy(data.PermitPermissions);
            }).error(function (data, status) {
                console.log(data);
            });

        } else {
            $scope.notificationAlert("Please select the builder");
        }
    };


    $scope.watchReadPermissionChange = function (index) {
        $scope.dataAfterChange[index].CanRead = $scope.permitPermissionList[index].CanRead;
        $scope.permitPermissionList[index].isChanges = true;

        var supervisorArray = $scope.dataAfterChange[index].UsersWithReadPermission.Supervisors;
        var buildersArray = $scope.dataAfterChange[index].UsersWithReadPermission.BuilderUsers;

        var combinedArray = supervisorArray.concat(buildersArray);

        if ($scope.dataAfterChange[index].CanRead) {
            for (var i = 0; i < $scope.BuilderUserIds.length; i++) {

                var checkBuilderAvailable = _.findWhere(combinedArray, {
                    Id: $scope.BuilderUserIds[i]
                });
                if (!checkBuilderAvailable) {
                    var isReadBuilder = _.findWhere($scope.permissionBasedUserList, {
                        Id: $scope.BuilderUserIds[i]
                    });
                    isReadBuilder.isNew = true;
                    $scope.dataAfterChange[index].UsersWithReadPermission.Supervisors.push(isReadBuilder);
                }
            }
        } else {
            var builderUserList = $scope.dataAfterChange[index].UsersWithReadPermission.Supervisors;
            if (builderUserList.length > 0) {
                var filtered = _.filter(builderUserList, function (item) {
                    return !item.isNew;
                });
                $scope.dataAfterChange[index].UsersWithReadPermission.Supervisors = filtered;
            }
        }
        $scope.watchPermissionChange();
    };

    $scope.watchUploadPermissionChange = function (index) {
        $scope.dataAfterChange[index].CanUpload = $scope.permitPermissionList[index].CanUpload;
        $scope.permitPermissionList[index].isChanges = true;


        var supervisorArray = $scope.dataAfterChange[index].UsersWithDocUploadPermission.Supervisors;
        var buildersArray = $scope.dataAfterChange[index].UsersWithDocUploadPermission.BuilderUsers;

        var combinedArray = supervisorArray.concat(buildersArray);

        if ($scope.dataAfterChange[index].CanUpload) {
            for (var i = 0; i < $scope.BuilderUserIds.length; i++) {

                var checkBuilderAvailable = _.findWhere(combinedArray, {
                    Id: $scope.BuilderUserIds[i]
                });
                if (!checkBuilderAvailable) {
                    var isUploadBuilder = _.findWhere($scope.permissionBasedUserList, {
                        Id: $scope.BuilderUserIds[i]
                    });
                    isUploadBuilder.isNew = true;
                    $scope.dataAfterChange[index].UsersWithDocUploadPermission.Supervisors.push(isUploadBuilder);
                }
            }
        } else {
            var builderUserList = $scope.dataAfterChange[index].UsersWithDocUploadPermission.Supervisors;
            if (builderUserList.length > 0) {
                var filtered = _.filter(builderUserList, function (item) {
                    return !item.isNew;
                });
                $scope.dataAfterChange[index].UsersWithDocUploadPermission.Supervisors = filtered;
            }
        }

        $scope.watchPermissionChange();
    };

    $scope.removeUserFrmUpload = function (parentIndex, index) {        
        
        $scope.permitPermissionList[parentIndex].UsersWithDocUploadPermission.BuilderUsers[index].isRemoved = true;
        $scope.permitPermissionList[parentIndex].isChanges = true;

        /* Get all user list */
        var allUpLoadBuilderUser = $scope.dataAfterChange[parentIndex].UsersWithDocUploadPermission.BuilderUsers;
        var selectedUploadBulUser = $scope.permitPermissionList[parentIndex].UsersWithDocUploadPermission.BuilderUsers[index];

        /* Remove selected user */
        var afterRemovedUpLoadBulUser = _.filter(allUpLoadBuilderUser, function (item) {
            return item.Id != selectedUploadBulUser.Id;
        });

        $scope.dataAfterChange[parentIndex].UsersWithDocUploadPermission.BuilderUsers = afterRemovedUpLoadBulUser;
        $scope.watchPermissionChange();
    };

    $scope.removeSuperFrmUpload = function (parentIndex, index) {
        $scope.permitPermissionList[parentIndex].UsersWithDocUploadPermission.Supervisors[index].isRemoved = true;
        $scope.permitPermissionList[parentIndex].isChanges = true;

        /* Get all user list */
        var allUpLoadSuperUser = $scope.dataAfterChange[parentIndex].UsersWithDocUploadPermission.Supervisors;
        var selectedUpLoadSupUser = $scope.permitPermissionList[parentIndex].UsersWithDocUploadPermission.Supervisors[index];

        /* Remove selected user */
        var afterRemovedUploadUser = _.filter(allUpLoadSuperUser, function (item) {
            return item.Id != selectedUpLoadSupUser.Id;
        });

        $scope.dataAfterChange[parentIndex].UsersWithDocUploadPermission.Supervisors = afterRemovedUploadUser;
        $scope.watchPermissionChange();
    };

    $scope.removeUserFrmRead = function (parentIndex, index) {
        $scope.permitPermissionList[parentIndex].UsersWithReadPermission.BuilderUsers[index].isRemoved = true;
        $scope.permitPermissionList[parentIndex].isChanges = true;

        /* Get all user list */
        var allBuilderUser = $scope.dataAfterChange[parentIndex].UsersWithReadPermission.BuilderUsers;
        var selectedBulUser = $scope.permitPermissionList[parentIndex].UsersWithReadPermission.BuilderUsers[index];

        /* Remove selected user */
        var afterRemovedBulUser = _.filter(allBuilderUser, function (item) {
            return item.Id !== selectedBulUser.Id;
        });
        $scope.dataAfterChange[parentIndex].UsersWithReadPermission.BuilderUsers = afterRemovedBulUser;

        $scope.watchPermissionChange();
    };

    $scope.removeSuperFrmRead = function (parentIndex, index) {
        
        $scope.permitPermissionList[parentIndex].UsersWithReadPermission.Supervisors[index].isRemoved = true;
        $scope.permitPermissionList[parentIndex].isChanges = true;

        var allSuperUser = $scope.dataAfterChange[parentIndex].UsersWithReadPermission.Supervisors;
        var selectedSupUser = $scope.permitPermissionList[parentIndex].UsersWithReadPermission.Supervisors[index];

        var afterRemovedUser = _.filter(allSuperUser, function (item) {
            return item.Id !== selectedSupUser.Id;
        });

        $scope.dataAfterChange[parentIndex].UsersWithReadPermission.Supervisors = afterRemovedUser;
        $scope.watchPermissionChange();
    };

    $scope.saveUserPermission = function () {

        var getChangesList = _.where($scope.permitPermissionList, {
            isChanges: true
        });

        var changesArrayList = _.map(getChangesList, function (obj) {
            // read permission array Objects
            var userRead = obj.UsersWithReadPermission.BuilderUsers;
            var superRead = obj.UsersWithReadPermission.Supervisors;

            //upload permission array Objects
            var userUpload = obj.UsersWithDocUploadPermission.BuilderUsers;
            var superUpload = obj.UsersWithDocUploadPermission.Supervisors;

            return {
                BuilderId: $scope.permissionBuildId, //obj.BuilderUserId,
                BuilderUserIds: $scope.BuilderUserIds ? $scope.BuilderUserIds.join() : '',
                CanRead: obj.CanRead,
                CanUpload: obj.CanUpload,
                PermitId: obj.PermitId,
                CreatedBy: parseInt($cookies.get('Id')),
                "UsersWithDocUploadPermission": {
                    "BuilderUsers": _.where(userUpload, {
                        isRemoved: true
                    }),
                    "Supervisors": _.where(superUpload, {
                        isRemoved: true
                    })
                },
                "UsersWithReadPermission": {
                    "BuilderUsers": _.where(userRead, {
                        isRemoved: true
                    }),
                    "Supervisors": _.where(superRead, {
                        isRemoved: true
                    })
                }
            };
        });
        /*var newData = [];
        newData.push($scope.dataAfterChange);*/

        if (changesArrayList) {
            APIs.saveUserPermitPermission(changesArrayList).success(function (data, status) {
                $scope.notificationAlert(data);
                console.log($scope.dataAfterChange);
                $scope.permitPermissionList = angular.copy($scope.dataAfterChange);
                $scope.enableSaveButton = true;
                $scope.BuilderUserIds = '';

                for (var i = 0; i < $scope.permitPermissionList.length; i++) {
                    $scope.permitPermissionList[i].CanRead = false;
                    $scope.permitPermissionList[i].CanUpload = false;
                    delete $scope.permitPermissionList[i].isChanges;
                }

            }).error(function (data, status) {
                console.log(data);
            });
        }
    };

    /* Watch form field changes */

    $scope.watchPermissionChange = function () {
        $scope.enableSaveButton = angular.equals($scope.originalData, $scope.permitPermissionList);
    };


    /* Pagination function */

    $scope.itemsPerPage = 10;
    $scope.currentPage = 1;

    $scope.range = function () {
        //var rangeSize = 4;
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
        //$scope.applyPermitsFilter();
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pageCount()) {
            $scope.currentPage++;
        }

        //$scope.applyPermitsFilter();
    };

    $scope.pageCount = function () {
        return Math.ceil($scope.TotalCount / $scope.itemsPerPage);
    };

    $scope.setPage = function (n) {
        $scope.currentPage = n;
        //$scope.applyPermitsFilter();
    };

});