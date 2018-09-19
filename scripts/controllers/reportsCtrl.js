'use strict';

angular.module('DBDG').controller('reportsCtrl',
    function ($rootScope, $scope, $location, $cookies, $filter, APIs, authFactory) {
    
    $scope.enableUserList = true;
    $scope.startSpinner = false;

        $scope.getAllAuditReports = function () {
            APIs.getAllReportsMembers().success(function (data, status) {
                $scope.AuditReports = data.AuditReports;
                $scope.BuilderList = data.BuilderList;
                $scope.TotalCount = data.TotalCount;
            }).error(function (data, status) {
                console.log(data);
            });
        };

        $scope.getMembersByBuilderId = function () {
            $scope.startSpinner = true;
            var data = {
                id: $scope.reportBulderId
            };
            APIs.getMembersByBuilder(data).success(function (data, status) {
                $scope.builderUserList = data;
                $scope.startSpinner = false;
                $scope.enableUserList = false;
            }).error(function (data, status) {
                console.log(data);
            });
        };

        $scope.resetFilterValues = function () {
            $scope.reportBulderId = '';
            $scope.bulderNameId = '';
            $scope.startDate = '';
            $scope.endDate = '';
            $scope.errMessage = '';
            $scope.getAllAuditReports();
        };

        //Date Comparision   
        $scope.dateChange = function () {
            if (new Date($scope.startDate).valueOf() > new Date($scope.endDate).valueOf()) {
                $scope.errMessage = 'End Date should be greater than start date';
            } else {
                $scope.errMessage = '';
            }
        }


        /* Filter Function */
        $scope.filterMembers = function (pageCount) {
            if (pageCount == 0) {
                $scope.currentPage = 1;
            }

            var isFilter = false;
            /*var pageCounts;*/
            if ($scope.reportBulderId || $scope.bulderNameId || $scope.startDate || $scope.endDate) {
                isFilter = true;
            }

            //pageCounts = (pageCount === 0) ? 0 : pageCount - 1;

            var reportData = {
                PageCount: $scope.currentPage - 1,
                Limit: $scope.itemsPerPage || 10,
                IsFilter: isFilter,
                FilterDefinition: {
                    Builder: $scope.reportBulderId || '',
                    User: $scope.bulderNameId || '',
                    StartDate: $scope.startDate || '',
                    EndDate: $scope.endDate || ''
                }
            };
            APIs.getReportsMembersByPagination(reportData).success(function (data, status) {
                $scope.AuditReports = data.AuditReports;
                $scope.TotalCount = data.TotalCount;
            }).error(function (data, status) {
                console.log(data);
            });
        };

        /* $scope.$watch('AuditReports', function (newValue, oldValue) {
             //$scope.currentPage = 1;
         });*/

        /* Sorting Function */
        $scope.sortBy = function (field) {
            var orderBy;
            if ($scope.sortReverse === true) {
                orderBy = field;
            } else {
                orderBy = '-' + field;
            }
            $scope.AuditReports = $filter('orderBy')($scope.AuditReports, orderBy);
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
            console.log($scope.currentPage);
            $scope.filterMembers();
        };

        $scope.nextPage = function () {
            if ($scope.currentPage < $scope.pageCount()) {
                $scope.currentPage++;
            }
            console.log($scope.currentPage);

            $scope.filterMembers();
        };

        $scope.pageCount = function () {
            return Math.ceil($scope.TotalCount / $scope.itemsPerPage);
        };

        $scope.setPage = function (n) {
            $scope.currentPage = n;
            $scope.filterMembers();
        };

    });