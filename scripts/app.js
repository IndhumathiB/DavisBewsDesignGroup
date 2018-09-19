'use strict';

/**
 * # DBDG
 *
 * Main module of the application.
 */
angular.module('DBDG', ['ngAnimate', 'ngAria', 'ngCookies', 'ngMessages', 'ngResource', 'ngRoute', 'ngSanitize', 'ngTouch', '720kb.datepicker', 'angular-loading-bar', 'wt.responsive'])

.constant("myConfig", {
    "protocol": "http://",
    "HOST": "166.62.84.37:8088",
    "crypticoSecret" :'wr7613dK48Q81D3WrXKHILV3tuSB1oOM',
    "crypticoSecretBit":1024
})

.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/login.html',
            controller: 'loginCtrl'
        })
        .when('/forgotpassword', {
            templateUrl: 'views/forgotpass.html',
            controller: 'loginCtrl',
            //controllerAs: 'main'
        })

    .when('/:menuName', {
            templateUrl: function (urlattr) {
                return 'views/' + urlattr.menuName + '.html';
            },
            controller: function ($scope, $routeParams, $controller) {
                $controller($routeParams.menuName + "Ctrl", {
                    $scope: $scope
                });
            },
            secure: true
        })
        .otherwise({
            redirectTo: '/'
        });
})

.run(function ($rootScope, $location, $cookies, $routeParams, authFactory) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {

        if (next.$$route.secure) {
            if (!authFactory.isAuthenticated()) {
                $location.path('/');
            }
        }

        if (authFactory.isAuthenticated() && $cookies.get('rememberMe') && $location.path() == '/') {
            $location.path('/' + authFactory.dynamicRoute()[0].urlName);
        }
    });

});