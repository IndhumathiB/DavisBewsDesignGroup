'use strict';
angular.module('DBDG').controller('baseCtrl', function ($rootScope, $scope, $location, $cookies, $timeout, $window, APIs, myConfig, authFactory) {
        /* baseUrl */
        $rootScope.baseUrl = myConfig.protocol + myConfig.HOST;
        $scope.initSidebar = false;
        /*$scope.showSidenav = true;*/

        $scope.hideSidebar = function () {
            $scope.initSidebar = $scope.initSidebar = !$scope.initSidebar;
            if ($scope.initSidebar) {
                angular.element(document.querySelector('.main')).addClass('sidebar-collapse');
            } else {
                angular.element(document.querySelector('.main')).removeClass('sidebar-collapse');
            }
        };

        $rootScope.sidebarMobileView = function () {
            angular.element(document.querySelector('#side-nav')).removeClass("collapsed");
        };

        $rootScope.hideViewSideBr = function () {
            angular.element(document.querySelector('#side-nav')).addClass("collapsed");
        };

        /* Success and Error Notification*/
        $scope.notificationAlert = function (message) {
            $scope.showAlert = true;
            $scope.message = message;

            $timeout(function () {
                $scope.showAlert = false;
                $scope.message = '';
            }, 3000);
        };

        $scope.closeNotificationAlert = function () {
            $scope.showAlert = false;
        };

        /* Logout functionality */
        $scope.logout = function () {
            var data = {
                LogId: $cookies.get('LogId'),
                UserId: $cookies.get('Id')
            }
            APIs.logoutMember(data).success(function (data, status) {
                authFactory.removeUserDetails();
                $location.path('/');

            }).error(function (data, status) {
                $scope.notificationAlert(data);
            });
        };

        if ($(window).width() <= 992) {
            $('#side-nav').addClass("collapsed");
        }

        $(window).resize(function () {
            var value = $(window).width();
            if (value <= 992) {
                angular.element(document.querySelector('.main')).removeClass('sidebar-collapse');
                angular.element(document.querySelector('#side-nav')).addClass("collapsed");
            } else {
                angular.element(document.querySelector('#side-nav')).removeClass("collapsed ng-hide");
                $scope.initSidebar = false;
            }
        });

        jQuery(window).trigger('resizeWindow');

    })
    .directive('tooltip', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).hover(function () {
                    $(element).tooltip('show');
                }, function () {
                    $(element).tooltip('hide');
                });
            }
        };
    })


.directive("scrolly", function ($window) {
    return function (scope, element, attrs) {
        angular.element($window).bind("scroll", function () {
            if (this.pageYOffset > 60) {
                scope.boolChangeClass = true;
            } else {
                scope.boolChangeClass = false;
            }
            scope.$apply();
        });
    };
});