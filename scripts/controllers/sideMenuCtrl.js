'use strict';

angular.module('DBDG').controller('sideMenuCtrl', function ($rootScope, $scope, $location, $cookies, $route, $routeParams, authFactory) {
    if ($cookies.getObject('RoleAuthorization')) {
        $scope.menuItems = authFactory.dynamicRoute();
    }

    /*  Show user Name in header */
    $rootScope.roleName = $cookies.get('UserName');
    $rootScope.role = parseInt($cookies.get('Role'));

    $scope.dynamicRoute = function (menuName, index) {
        var urlMenuName = '';
        if (menuName && menuName.trim() === 'UserPermit Permission') {
            $scope.sideMenuName = '/permission';
        } else if (menuName && menuName.trim() === 'User Management') {
            $scope.sideMenuName = '/userManagement';
        } else {
            urlMenuName = menuName.replace(/\s/g, '');
            $scope.sideMenuName = '/' + urlMenuName.toLowerCase();
        }

    };  
});