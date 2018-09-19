'use strict';

angular.module('DBDG').controller('permitsCtrl', function ($scope, $rootScope, $location, $cookies, $filter, $q, $timeout, $window, APIs, authFactory) {

    /* Get Role from cookie value */
    $scope.loggedUserRole = parseInt($cookies.get('Role'));
    $scope.enableSaveButton = true;
    $scope.enableUserList = true;
    $scope.startSpinner = false;
    $scope.allPermitsList = [];


    /* Get default datas */
    $scope.getAllDefaultPermits = function () {

        $scope.dataLoadingSpinner = false;
        $scope.editMode = false;
        $scope.newEntry = false;

        var userData = {
            "MemberId": parseInt($cookies.get('Id')),
            "RoleId": parseInt($cookies.get('Role'))
        };

        APIs.getAllPermits(userData).success(function (data, status) {
            $scope.buildersList = data.BuildersList;
            $scope.allPermitsList = data.PermitsList;
            $scope.municipalityList = data.Municipality;
            $scope.modelList = data.Model;
            $scope.communityList = data.Community;
            $scope.orderTypeList = data.OrderType;
            $scope.PdfStatusList = data.PdfStatus;
            $scope.TotalRowCount = data.TotalRowCount;
            $scope.dataLoadingSpinner = true;
        }).error(function (data, status) {
            $scope.notificationAlert("Something went wrong");
            console.log(data);
        });
    };

    /* Get list of users for drop down */
    $scope.getUserByBuilderId = function () {
        $scope.startSpinner = true;
        var data = {
            id: $scope.builderId
        };
        APIs.getMembersByBuilder(data).success(function (data, status) {
            $scope.startSpinner = false;
            $scope.userList = data;
            $scope.enableUserList = false;
        }).error(function (data, status) {
            $scope.notificationAlert("Something went wrong");
            console.log(data);
        });
    };

    /* Edit table controls */
    $scope.editTables = function () {
        $scope.editMode = true;
        $scope.editOldData = angular.copy($scope.allPermitsList);
    };

    /* Get Builder Contact list*/

    $scope.getBuilderContactList = function (buildContactId) {
        APIs.GetBuilderContact(buildContactId).success(function (data, status) {
            $scope.builderContactList = data;
        }).error(function (data, status) {
            $scope.notificationAlert("Something went wrong");
            console.log(data);
        });
    };

    /*Dynamically find x and y axis position for date picker*/
    $scope.datePickerPos = function (event) {
        var sideNavWidth = document.getElementById("side-nav").offsetWidth;

        var width = event.clientX - sideNavWidth;
        $("datepicker ._720kb-datepicker-calendar").css("left", width + "px");
    };

    /* Watch changes in grid field */
    $scope.changesInGrid = function (index) {
        $scope.allPermitsList[index].isChanges = true;
        if ($scope.allPermitsList[index].OrderTypeId) {

            switch ($scope.allPermitsList[index].OrderTypeId) {
                case 4:
                    $scope.allPermitsList[index].BusinessDays = 7; //permitting
                    break;
                case 5:
                    $scope.allPermitsList[index].BusinessDays = 5; // PDF only
                    break;
                default:
                    $scope.allPermitsList[index].BusinessDays = 0; //default
                    break;
            }
        }

        $scope.enableSaveButton = false; /* Watch form field changes */

        /* BusinessDays days and BusinessDayMetric Date Manupulations */
        $timeout(function () {
            $scope.calcMetricDate($scope.allPermitsList[index].DBDG_in_date, $scope.allPermitsList[index].BusinessDays, index);

            if ($scope.allPermitsList[index].BusinessDayMetric) {

                if ($scope.allPermitsList[index].DeliveryToClient == '') {
                    $scope.calcNumberOfdays(new Date(), $scope.allPermitsList[index].BusinessDayMetric, index);
                } else {
                    $scope.calcNumberOfdays($scope.allPermitsList[index].DeliveryToClient, $scope.allPermitsList[index].BusinessDayMetric, index);
                }
            }

            $scope.calculatePercentage(index);
            $scope.checkFieldStatus(index);
            $scope.checkFieldColor(index);
            $scope.checkParticularFieldColor(index);
            //$scope.validateDate(index);

        }, 500);
    };


    /* Call save API for new and update */
    $scope.saveChanges = function () {
        $scope.dataLoadingSpinner = false;
        var permitChangesList = _.where($scope.allPermitsList, {
            isChanges: true
        });

        var changedPermitsList = _.map(permitChangesList, function (obj) {
            var orderName = _.where($scope.orderTypeList, {
                Id: obj.OrderTypeId
            });
            var selectedPdfStatus = _.where($scope.PdfStatusList, {
                Id: obj.PDF_StatusId
            });
            var selectedMunicipality = _.where($scope.municipalityList, {
                Id: obj.MunicipalityId
            });
            var selectedCommunity = _.where($scope.communityList, {
                Id: obj.CommunityId
            });
            var selectedModel = _.where($scope.modelList, {
                Id: obj.ModelId
            });

            if (orderName.length > 0) {
                obj.OrderTypeName = orderName[0].Value;
            } else {
                obj.OrderTypeName = '';
            }

            if (selectedPdfStatus.length > 0) {
                obj.PDF_StatusName = selectedPdfStatus[0].Value;
            } else {
                obj.PDF_StatusName = '';
            }

            if (selectedMunicipality.length > 0) {
                obj.MunicipalityName = selectedMunicipality[0].Value;
            } else {
                obj.MunicipalityName = '';
            }

            if (selectedCommunity.length > 0) {
                obj.CommunityName = selectedCommunity[0].Value;
            } else {
                obj.CommunityName = '';
            }

            if (selectedModel.length > 0) {
                obj.ModelName = selectedModel[0].Value;
            } else {
                obj.ModelName = '';
            }
            obj.CreatedBy = parseInt($cookies.get('Id'));
            obj.OrderTypeId = obj.OrderTypeId ? obj.OrderTypeId : 0;
            obj.MunicipalityId = obj.MunicipalityId ? obj.MunicipalityId : 0;
            obj.CommunityId = obj.CommunityId ? obj.CommunityId : 0;
            obj.ModelId = obj.ModelId ? obj.ModelId : 0;
            obj.PDF_StatusId = obj.PDF_StatusId ? obj.PDF_StatusId : 0;
            var searchVal = "N/A";
            var replaceVal = "";
            var resultObject = _.each(obj, function (value, key) {
                if (value === searchVal) {
                    obj[key] = replaceVal;
                }
            });


            return _.omit(resultObject, "CreatedDate", "IsActive", "ModifiedBy", "ModifiedDate", "PercentageOfComplition", "isChanges", "newInsert");
        });

        if (changedPermitsList.length > 0) {
            if ($scope.allPermitsList[0].newInsert) {

                if ($scope.allPermitsList[0].BuilderId && $scope.allPermitsList[0].DBDG_in_date) {
                    changedPermitsList[0].BuilderContactId = changedPermitsList[0].BuilderContactId ? changedPermitsList[0].BuilderContactId.join() : '';
                    APIs.savePermits(changedPermitsList).success(function (data, status) {
                        dataManupulation();
                        clearIschanges();
                        $scope.editMode = false;
                        $scope.allPermitsList[0].PermitId = parseInt(data);
                        $scope.allPermitsList[0].newInsert = false;
                        $scope.newEntry = false;
                        $scope.allPermitsList[0].PercentageOfComplition = $scope.allPermitsList[0].PercentageOfComplition;
                        $scope.allPermitsList[0].BuilderContactId = "";
                        $scope.notificationAlert("Permit successfully Added");
                        $scope.dataLoadingSpinner = true;
                    }).error(function (data, status) {
                        $scope.notificationAlert("Something went wrong");
                        $scope.dataLoadingSpinner = true;
                        console.log(data);
                    });
                } else {
                    $scope.filedMissing = true;
                    $scope.dataLoadingSpinner = true;
                    $scope.notificationAlert("Please fill the required fields");
                }
            } else {
                APIs.savePermits(changedPermitsList).success(function (data, status) {
                    dataManupulation();
                    clearIschanges();
                    $scope.editOldData = '';
                    $scope.editMode = false;
                    $scope.notificationAlert("Permit successfully updated");
                    $scope.dataLoadingSpinner = true;
                }).error(function (data, status) {
                    $scope.notificationAlert("Something went wrong");
                    console.log(data);
                });
            }


            //Function 
            function dataManupulation() {
                for (var i = 0; i < changedPermitsList.length; i++) {
                    var indexValue = _.findIndex($scope.allPermitsList, {
                        PermitId: changedPermitsList[i].PermitId || 0
                    });

                    var orderName = _.where($scope.orderTypeList, {
                        Id: changedPermitsList[i].OrderTypeId
                    });

                    if (orderName.length > 0) {
                        $scope.allPermitsList[indexValue].OrderTypeName = orderName[0].Value;
                    } else {
                        $scope.allPermitsList[indexValue].OrderTypeName = '';
                    }

                    var selectedPdfStatus = _.where($scope.PdfStatusList, {
                        Id: changedPermitsList[i].PDF_StatusId
                    });

                    if (selectedPdfStatus.length > 0) {
                        $scope.allPermitsList[indexValue].PDF_StatusName = selectedPdfStatus[0].Value;
                    } else {
                        $scope.allPermitsList[indexValue].PDF_StatusName = '';
                    }

                    var selectedMunicipality = _.where($scope.municipalityList, {
                        Id: changedPermitsList[i].MunicipalityId
                    });

                    if (selectedMunicipality.length > 0) {
                        $scope.allPermitsList[indexValue].MunicipalityName = selectedMunicipality[0].Value;
                    } else {
                        $scope.allPermitsList[indexValue].MunicipalityName = '';
                    }

                    var selectedCommunity = _.where($scope.communityList, {
                        Id: changedPermitsList[i].CommunityId || 0
                    });

                    if (selectedCommunity.length > 0) {
                        $scope.allPermitsList[indexValue].CommunityName = selectedCommunity[0].Value
                    } else {
                        $scope.allPermitsList[indexValue].CommunityName = '';
                    }

                    var selectedModel = _.where($scope.modelList, {
                        Id: changedPermitsList[i].ModelId
                    });

                    if (selectedModel.length > 0) {
                        $scope.allPermitsList[indexValue].ModelName = selectedModel[0].Value;
                    } else {
                        $scope.allPermitsList[indexValue].ModelName = '';
                    }

                    //delete changedPermitsList[i].isChanges;
                }
            }


            function clearIschanges() {
                var dataLength = $scope.allPermitsList.length;
                for (var j = 0; j < dataLength; j++) {
                    delete $scope.allPermitsList[j].isChanges;
                }
            }
        }
    };

    $scope.cancelEdit = function () {
        var cancelConfirmation = confirm('Are you sure you want to cancel?');

        if (cancelConfirmation === true) {
            $scope.editMode = false;
            $scope.newEntry = false;
            if ($scope.allPermitsList[0].newInsert) {
                $scope.allPermitsList.splice(0, 1);
                $scope.builderContactList = '';
            } else {
                var permitChangesList = _.where($scope.allPermitsList, {
                    isChanges: true
                });
                if (permitChangesList.length > 0) {
                    $scope.allPermitsList = $scope.editOldData;
                }
            }
        }
    };


    $scope.createNewPermit = function () {

        var newEntryList = _.where($scope.allPermitsList, {
            newInsert: true
        });

        if (newEntryList.length === 0) {

            $scope.newEntry = true;
            var newPermitEntry = {
                "BilledDate": "",
                "BuilderId": 0,
                "BuilderContactId": 0,
                "BusinessDayMetric": "",
                "BusinessDays": 0,
                "CommunityId": 0,
                "ContactName": "",
                "ContractReview": "",
                "CreatedBy": 0,
                "CreatedDate": "",
                "DBDG_in_date": "",
                "Days": "",
                "DaysPast": 0,
                "DeliveryToClient": "",
                "EcalcsOrddate": "",
                "EcalcsRcvddate": "",
                "ElectronicTrussesRecDate": "",
                "HardCopyTrussPkgRecDate": "",
                "IsActive": 0,
                "JobNumber": "",
                "LotNumber": "",
                "MemberId": 0,
                "ModelId": 0,
                "ModifiedBy": 0,
                "ModifiedDate": "",
                "MunicipalityId": 0,
                "Notes": "",
                "OrderTypeId": 0,
                "PDF_StatusId": 0,
                "PercentageOfComplition": 0,
                "PermitId": 0,
                "PlanSentToEngineerDate": "",
                "PostedToBuzzsawDropbox": "",
                "PrintsOrderedDate": "",
                "QaPerson": "",
                "SiteOrddate": "",
                "SiteRcvdDate": "",
                "SqftToClient": "",
                "TrussLetterRecDate": "",
                "TrussOrddate": "",
                "newInsert": true
            };

            if ($scope.allPermitsList && $scope.allPermitsList.length > 0) {
                $scope.allPermitsList.unshift(newPermitEntry);
            } else {
                $scope.allPermitsList.push(newPermitEntry);
            }
        } else {
            $scope.notificationAlert("Already new entry created");
        }

    };

    /* Delete record */
    $scope.deleteFieldFromFGrid = function (index, permitId) {
        var deleteData = {
            "ModifiedBy": parseInt($cookies.get('Id')),
            "PermitId": permitId
        };
        var deleteConfirmation = confirm('Are you sure you want to delete?');
        if (deleteConfirmation === true) {
            APIs.deletePemits(deleteData).success(function (data, status) {
                $scope.notificationAlert("User successfully deleted");
                $scope.allPermitsList.splice(index, 1);

                if ($scope.allPermitsList.length === 0) {
                    $scope.prevPage();
                }
            }).error(function (data, status) {
                $scope.notificationAlert("Something went wrong");
                console.log(data);
            });
        }
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
            $scope.notificationAlert("Something went wrong");
            console.log(data);
        });
    };


    /* Filter Function */
    $scope.filterPermitsByParams = function (pageNumber) {
        $scope.dataLoadingSpinner = false;
        var isFilter = false;
        if ($scope.builderId && pageNumber == 0) {
            $scope.currentPage = 1;
            isFilter = true;
        };

        var filterData = {

            "BuilderId": $scope.builderId ? $scope.builderId : "",
            "IsFilter": isFilter,
            "Limit": $scope.itemsPerPage,
            "MemberId": $scope.userId ? $scope.userId : "",
            "PageCount": $scope.currentPage - 1,
            "RoleId": parseInt($cookies.get('Role'))
        };

        APIs.filterPemits(filterData).success(function (data, status) {
            $scope.allPermitsList = data.PermitsList;
            $scope.TotalRowCount = data.TotalRowCount;
            $scope.dataLoadingSpinner = true;
        }).error(function (data, status) {
            $scope.notificationAlert("Something went wrong");
            console.log(data);
        });

    };

    /* Reset Filed data and refreshing the data list */
    $scope.resetFieldData = function () {
        $scope.builderId = '';
        $scope.userId = '';
        $scope.getAllDefaultPermits();
    };


    /* Sorting function */

    $scope.sortBy = function (field) {
        var orderBy;
        if (!$scope.newEntry && !$scope.editMode) {
            if ($scope.sortReverse === true) {
                orderBy = field;
            } else {
                orderBy = '-' + field;
            }
            $scope.allPermitsList = $filter('orderBy')($scope.allPermitsList, orderBy);
        }
    };


    /* Watch File Upload functionality */
    $scope.multipleFiles = [];

    $scope.$watch(function () {
        return $scope.myFile;
    }, function (newValue) {
        if (newValue) {
            console.log(newValue);
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
                $timeout(function () {
                    $scope.multipleFiles.splice(i, 1);
                    $scope.uploadFile(currentId);
                }, 1000);



            }).error(function (data, status) {
                $scope.notificationAlert("Something went wrong");
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


    /* Calculate business Metric days*/

    $scope.calcMetricDate = function (dbdgDate, noOfDaysToAdd, index) {

        if (dbdgDate && noOfDaysToAdd) {
            var startDate = new Date(dbdgDate);
            var endDate = "";
            var count = 0;
            while (count < noOfDaysToAdd) {
                endDate = new Date(startDate.setDate(startDate.getDate() + 1));
                if (endDate.getDay() != 0 && endDate.getDay() != 6) {
                    count++;
                }
            }

            if (endDate) {
                var ds = new Date(endDate);
                var eDate = endDate.getDate();
                var Month = endDate.getMonth() + 1;
                var Year = endDate.getFullYear();
                var EndDate = Month + '/' + eDate + '/' + Year;
            }

            $scope.allPermitsList[index].BusinessDayMetric = EndDate ? EndDate : '';
        } else {
            $scope.allPermitsList[index].BusinessDayMetric = dbdgDate;
        }
    };

    $scope.calcNumberOfdays = function (deliveryToClient, BusinessDayMetric, index) {
        var firstDate = new Date(deliveryToClient).valueOf();
        var secondDate = new Date(BusinessDayMetric).valueOf();

        if (firstDate > secondDate) {
            var startDate = new Date(BusinessDayMetric);
            var endDate = new Date(deliveryToClient);
            var result = -1;
        } else {
            var startDate = new Date(deliveryToClient);
            var endDate = new Date(BusinessDayMetric);
            var result = 1;
        }

        var count = 0;
        var curDate = startDate;
        while (curDate <= endDate) {
            var dayOfWeek = curDate.getDay();
            if (!((dayOfWeek == 6) || (dayOfWeek == 0)))
                count++;
            curDate.setDate(curDate.getDate() + 1);
        }
        $scope.allPermitsList[index].DaysPast = ((count * result) - 1);

    };

    /* Check field status */
    $scope.checkFieldStatus = function (index) {
        var fieldDisabled = false;            

        if ($scope.allPermitsList[index].OrderTypeId == 4) {
            fieldDisabled = false;
        }
        
        if ($scope.allPermitsList[index].OrderTypeId == 5) {
            fieldDisabled = true;
        }

        if ($scope.allPermitsList[index].MunicipalityId == 6 || $scope.allPermitsList[index].MunicipalityId == 7 || $scope.allPermitsList[index].MunicipalityId == 8) {
            fieldDisabled = true;
        }
        return fieldDisabled;
    };


    /* Check field color */

    $scope.checkFieldColor = function (index) {
        $scope.allPermitsList[index].fieldColor = '';
        $scope.allPermitsList[index].pdfFieldColor = '';

        if ($scope.allPermitsList[index].DeliveryToClient) {
            $scope.allPermitsList[index].fieldColor = 'green font-color';
        }

        if ($scope.allPermitsList[index].PDF_StatusId == 82) {
            $scope.allPermitsList[index].pdfFieldColor = 'green font-color';
        }

        if ($scope.allPermitsList[index].PDF_StatusId == 83) {
            $scope.allPermitsList[index].pdfFieldColor = 'purple font-color';
        }

        if ($scope.allPermitsList[index].ClientFeedback) {
            $scope.allPermitsList[index].fieldColor = 'orange font-color';
        }

        if ($scope.allPermitsList[index].CompletedOrInvoiced) {
            $scope.allPermitsList[index].fieldColor = 'green font-color';
        }

    };
    
    $scope.checkParticularFieldColor = function (index) {
        $scope.allPermitsList[index].particularFieldColor = '';

        if ($scope.allPermitsList[index].DeliveryToClient) {
            $scope.allPermitsList[index].particularFieldColor = 'green font-color';
        }

        if ($scope.allPermitsList[index].ClientFeedback) {
            $scope.allPermitsList[index].particularFieldColor = 'orange font-color';
        }

        if ($scope.allPermitsList[index].CompletedOrInvoiced) {
            $scope.allPermitsList[index].particularFieldColor = 'green font-color';
        }

    };


    /* Calculate percentage */
    $scope.calculatePercentage = function (index) {
        $scope.allPermitsList[index].PercentageOfComplition = 10;

        if ($scope.allPermitsList[index].SiteOrddate) {
            $scope.allPermitsList[index].PercentageOfComplition = 20;
        }

        if ($scope.allPermitsList[index].SiteRcvdDate) {
            $scope.allPermitsList[index].PercentageOfComplition = 35;
        }

        if ($scope.allPermitsList[index].PDF_StatusId && $scope.allPermitsList[index].PDF_StatusId == 83) {
            $scope.allPermitsList[index].PercentageOfComplition = 50;
        }

        if ($scope.allPermitsList[index].PDF_StatusId && $scope.allPermitsList[index].PDF_StatusId == 82) {
            $scope.allPermitsList[index].PercentageOfComplition = 65;
        }

        if ($scope.allPermitsList[index].PrintsOrderedDate) {
            $scope.allPermitsList[index].PercentageOfComplition = 80;
        }

        if ($scope.allPermitsList[index].DeliveryToClient) {
            $scope.allPermitsList[index].PercentageOfComplition = 90;
        }

        if ($scope.allPermitsList[index].PostedToBuzzsawDropbox) {
            $scope.allPermitsList[index].PercentageOfComplition = 100;
        }
    };

    /*Check date mm/dd/yyyy format */

    /*$scope.validateDate = function (givenDate) {
        ng-blur=" permits.DBDG_in_date = validateDate(permits.DBDG_in_date)"
        console.log(givenDate);
        var date_regex = /^\d{0,2}\/\d{0,2}\/\d{4}$/;
        console.log(date_regex.test(givenDate));
        if (date_regex.test(givenDate)) {
            return givenDate;
        } else {
            return '';
        }
    };*/

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
        $scope.filterPermitsByParams();
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pageCount()) {
            $scope.currentPage++;
        }
        $scope.filterPermitsByParams();
    };

    $scope.pageCount = function () {
        return Math.ceil($scope.TotalRowCount / $scope.itemsPerPage);
    };

    $scope.setPage = function (n) {
        $scope.currentPage = n;
        $scope.filterPermitsByParams();
    };

    $window.onbeforeunload = function () {
        if ($scope.editMode) {
            return "Are you sure you want to navigate away from this page without save?";
        }
    };

    $scope.$on('$locationChangeStart', function (event, next, current) {
        if ($scope.editMode) {
            if (!confirm("Are you sure you want to navigate away from this page without save?")) {
                event.preventDefault();
            }
        }
    });


    /* Instead of Jquery use angular for dom manupulation */
    $scope.callSCrollBar = function () {
        $timeout(function () {
            $scope.tableWidth = $(".table-responsive.cus-cards").width();
            $(".cus-scroll-container").width($scope.tableWidth);
        }, 1000);

    };

    /*calling scroll bar function from basecontroller*/

    function scrollBar() {
        $scope.tableWidth = $(".table-responsive.cus-cards").width();
        $(".cus-scroll-container").scroll(function () {
            $(".table-responsive.cus-cards").scrollLeft($(".cus-scroll-container").scrollLeft());
        });
        $(".table-responsive cus-cards").scroll(function () {
            $(".cus-scroll-container").scrollLeft($(".table-responsive.cus-cards").scrollLeft());
        });
        //$(".cus-scroll-container").width($scope.tableWidth);
    }
    scrollBar();

    jQuery(window).trigger('resizeWindow');

});


angular.module('DBDG').directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);