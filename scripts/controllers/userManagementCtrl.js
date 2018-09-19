'use strict';

angular.module('DBDG').controller('usermanagementCtrl',
    function ($rootScope, $scope, $location, $cookies, $filter, APIs, authFactory) {

        /*userManageMentRole();*/
        $scope.enableSaveBtn = true;
        /* Create New User Form Hide and Show */
        $scope.createNewUser = function () {
            $scope.actionName = 'Save';
            $scope.hideListView = true;
            $scope.editUserField = false;
            $scope.showExistUserName = false;
            $scope.showExistUserEmail = false;
            $scope.submitted = false;
            $scope.functionName = "Create New User";
            $scope.userManagement = {};
        };

        $scope.cancelCreateNewUser = function () {
            var cancelConfirmation = confirm('Are you sure you want to cancel?');
            if (cancelConfirmation === true) {
                $scope.showExistUserName = false;
                $scope.showExistUserEmail = false;
                $scope.hideListView = false;
                $scope.userManagement = {};
            }
        };


        /* Validate existing user name */
        $scope.validateUserName = function () {
            var userData = {
                UserName: $scope.userManagement.UserName
            };

            if ($scope.userManagement.UserName) {

                APIs.validateUserAndEmailValue(userData).success(function (data, status) {
                    $scope.showExistUserName = true;
                    $scope.userNameMessage = data;
                    $scope.userNamecolor = 'font-green';

                }).error(function (data, status) {
                    $scope.showExistUserName = true;
                    $scope.userNameMessage = data;
                    $scope.userNamecolor = 'required';
                });
            }
        };


        /* Validate existing email */
        $scope.validateUserEmail = function () {
            var userData = {
                UserName: $scope.userManagement.EmailId
            };

            if ($scope.userManagement.EmailId) {

                APIs.validateUserAndEmailValue(userData).success(function (data, status) {
                    $scope.showExistUserEmail = true;
                    $scope.userEmailMessage = data;
                    $scope.emailcolor = 'font-green';
                }).error(function (data, status) {
                    $scope.showExistUserEmail = true;
                    $scope.userEmailMessage = data;
                    $scope.emailcolor = 'required';

                });
            }
        };


        /* Watch form field changes */
        $scope.watchUserChange = function () {
            $scope.enableSaveBtn = angular.equals($scope.originalData, $scope.userManagement);
        };

        /* Get all user manage menbers */
        $scope.getAllUserManageMembers = function () {

            APIs.getAllUserManageMembers().success(function (data, status) {
                $scope.roleList = data.RoleList;
                $scope.memberList = data.MemberList;
                $scope.builderList = data.BuilderList;
                $scope.TotalRowCount = data.TotalRowCount;

            }).error(function (data, status) {
                $scope.notificationAlert("Something went wrong");
                console.log(data);
            });
        };


        /* Reset filter data */

        $scope.resetRoleData = function () {
            $scope.getAllUserManageMembers();
            $scope.selectedRole = '';
        };

        /* Add and update user functions */
        $scope.addNewUser = function (id) {
            $scope.submitted = true;
            var BuilderId;

            if ($scope.userManagement.BuilderId && $scope.userManagement.BuilderId.length > 1) {
                BuilderId = $scope.userManagement.BuilderId.join();
            } else if ($scope.userManagement.BuilderId instanceof Array) {
                BuilderId = $scope.userManagement.BuilderId[0];
            } else {
                BuilderId = $scope.userManagement.BuilderId || 0;
            }

            var addUserData = {
                'UserId': id,
                'FirstName': $scope.userManagement.FirstName,
                'LastName': $scope.userManagement.LastName,
                'BuilderId': BuilderId,
                'RoleId': $scope.userManagement.RoleId,
                'UserName': $scope.userManagement.UserName,
                'Password': $scope.userManagement.Password,
                'PhoneNo': $scope.userManagement.PhoneNo,
                'EmailId': $scope.userManagement.EmailId,
                'FaxNo': $scope.userManagement.FaxNo,
                'Address1': $scope.userManagement.Address1,
                'Address2': $scope.userManagement.Address2,
                'City': $scope.userManagement.City,
                'State': $scope.userManagement.State,
                'ZipCode': $scope.userManagement.ZipCode,
                'Notes': $scope.userManagement.Notes,
                'CreatedBy': $cookies.get('Id')
            };


            if (id) {
                APIs.addUserManageMembers(addUserData).success(function (data, status) {

                    addUserData.UserId = parseInt(data);
                    addUserData.FirstName = addUserData.FirstName + ' ' + addUserData.LastName;

                    var roleName = _.where($scope.roleList, {
                        RoleId: $scope.userManagement.RoleId
                    });
                    addUserData.RoleName = roleName[0].RoleName;
                    addUserData.State = addUserData.City + ', ' + addUserData.State;

                    var objIndex = _.findIndex($scope.memberList, {
                        UserId: parseInt(data)
                    });

                    $scope.memberList[objIndex] = addUserData;
                    $scope.notificationAlert( addUserData.RoleName +" changes has been updated successfully");

                    //Dom Activity
                    $scope.enableSaveBtn = true;
                    $scope.hideListView = false;
                }).error(function (data, status) {
                    $scope.notificationAlert("Something went wrong");
                    console.log(data);
                    /*$scope.notificationAlert(data);*/
                });

            } else {
                if (!$scope.newUserForm.$invalid) {
                    APIs.addUserManageMembers(addUserData).success(function (data, status) {

                        addUserData.UserId = parseInt(data);
                        var roleName = _.where($scope.roleList, {
                        RoleId: $scope.userManagement.RoleId
                         });
                        addUserData.RoleName = roleName[0].RoleName;
                        $scope.memberList.push(addUserData);
                        $scope.TotalRowCount = $scope.TotalRowCount + 1;

                        //Dom and User Activity
                        $scope.enableSaveBtn = true;
                        $scope.notificationAlert(addUserData.RoleName +" successfully created");
                        $scope.hideListView = false;

                    }).error(function (data, status) {
                        $scope.notificationAlert("Something went wrong");
                        console.log(data);
                        /*$scope.notificationAlert(data);*/
                    });
                }
            }
        };

        /* Get user management members by role */
        $scope.findMembersByRole = function (roleId) {
            $scope.selectedRole = roleId;
            var data = {
                roleId: roleId
            };
            APIs.getUserManageMembersByRole(data).success(function (data, status) {
                $scope.memberList = data.MemberList;
                $scope.TotalRowCount = data.TotalCount;
                $scope.currentPage = 1;
            }).error(function (data, status) {
                /*$scope.notificationAlert(data);*/
                console.log(data);
            });
        };

        /* Edit User function */
        $scope.editUser = function (index) {
            $scope.showExistUserName = false;
            $scope.showExistUserEmail = false;
            $scope.actionName = 'Update Changes';
            $scope.functionName = "Edit User";
            $scope.enableSaveBtn = true;
            $scope.editUserField = true;
            $scope.hideListView = true;
            $scope.userManagement = {};

            var data = {
                id: parseInt($scope.memberList[index].UserId)
            };

            APIs.editUserManageMembers(data).success(function (data, status) {
                var userManageData = data;
                var listOfBuilderId;
                if (data && data.RoleId === 2) {
                    userManageData.BuilderId = data.BuilderId.split(',').map(function (val1) {
                        return Number(val1);
                    });

                } else {
                    userManageData.BuilderId = parseInt(data.BuilderId);
                }
                $scope.userManagement = userManageData;
                $scope.originalData = angular.copy(userManageData);
            }).error(function (data, status) {
                $scope.notificationAlert("Something went wrong");
                console.log(data);
            });
        };


        /* Delete user function */
        $scope.deleteUser = function (index) {
            var data = {
                ModifiedBy: parseInt($cookies.get('Id')),
                UserId: parseInt($scope.memberList[index].UserId)
            };
            var deleteConfirmation = confirm('Are you sure you want to delete?');
            if (deleteConfirmation === true) {
                APIs.deleteUserManageMembers(data).success(function (data, status) {
                    $scope.memberList.splice(index, 1);
                    $scope.TotalRowCount = $scope.TotalRowCount - 1;
                    $scope.notificationAlert("User successfully deleted");
                    if ($scope.memberList.length === 0) {
                        $scope.prevPage();
                    }
                }).error(function (data, status) {
                    $scope.notificationAlert("Something went wrong");
                    console.log(data);
                    /*$scope.notificationAlert(data);*/
                });
            }

        };

        /* Sorting function */

        $scope.sortBy = function (field) {
            var orderBy;
            if ($scope.sortReverse === true) {
                orderBy = field;
            } else {
                orderBy = '-' + field;
            }
            $scope.memberList = $filter('orderBy')($scope.memberList, orderBy);
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
            var data = {
                PageCount: $scope.currentPage,
                Limit: $scope.itemsPerPage || 10,
                RoleId: $scope.selectedRole || ''
            };
            getMembersByPage(data);
        };

        $scope.nextPage = function () {
            if ($scope.currentPage < $scope.pageCount()) {
                $scope.currentPage++;
            }

            var data = {
                PageCount: $scope.currentPage,
                Limit: $scope.itemsPerPage || 10,
                RoleId: $scope.selectedRole || ''
            };
            getMembersByPage(data);
        };

        $scope.pageCount = function () {
            return Math.ceil($scope.TotalRowCount / $scope.itemsPerPage);
        };

        $scope.setPage = function (n) {

            $scope.currentPage = n;
            var data = {
                PageCount: $scope.currentPage,
                Limit: $scope.itemsPerPage || 10,
                RoleId: $scope.selectedRole || ''
            };
            getMembersByPage(data);

        };


        function getMembersByPage(data) {
            APIs.getMembersByPagination(data).success(function (data, status) {
                $scope.memberList = data;
            }).error(function (data, status) {
                $scope.notificationAlert("Something went wrong");
                console.log(data);
            });
        }

    });