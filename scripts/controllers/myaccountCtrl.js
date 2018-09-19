'use strict';

angular.module('DBDG').controller('myaccountCtrl',
    function ($rootScope, $scope, $location, $cookies, $filter, APIs, authFactory) {
        $scope.enableSaveBtn = true;
        /*Redirect to Usermanagement*/
        /*$scope.redirect = function () {
            var cancelConfirmation = confirm('Are you sure you want to cancel?');
            if (cancelConfirmation === true) {
            window.location = "#/userManagement";
            }
        }*/


        /* Edit User */
        $scope.editUser = function () {
            var data = {
                id: parseInt($cookies.get('Id'))
            }
            APIs.editUserManageMembers(data).success(function (data, status) {
                $scope.userManagement = data;
                $scope.originalData = angular.copy(data);
            }).error(function (data, status) {
                $scope.notificationAlert("Something went wrong");
                console.log(data);
            });
        };

        /* Watch form field changes */
        $scope.watchUserChange = function () {
            $scope.enableSaveBtn = angular.equals($scope.originalData, $scope.userManagement);
        };
    
        /* Update user */
        $scope.updateUser = function (id) {
            $scope.submitted = true;
            var addUserData = {
                'UserId': id,
                'FirstName': $scope.userManagement.FirstName,
                'LastName': $scope.userManagement.LastName,
                'BuilderId': $scope.userManagement.BuilderId,
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
                'CreatedBy': parseInt($cookies.get('Id'))
            }
            
            var isValid;
            if($scope.userManagement.newPwd === $scope.userManagement.Password){
                isValid = true;
            }else if(!$scope.userManagement.newPwd && !$scope.userManagement.Password){
                isValid = true;
            }else{
                isValid = false;
                $scope.showConfirmAlert = "Confirm password cannot be blank";
            }
            
            
            if (isValid && !$scope.myAccountForm.$invalid) {
                APIs.addUserManageMembers(addUserData).success(function (data, status) {
                    $scope.notificationAlert("Information updated successfully ");
                    $scope.memberList = addUserData;
                }).error(function (data, status) {
                    $scope.enableSaveBtn = false;
                    $scope.notificationAlert("Something went wrong");
                    console.log(data);
                });
            }
        };


    });