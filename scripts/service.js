angular.module('DBDG').service('APIs', function ($http, myConfig, authFactory) {

    var serviceUrlBase = myConfig.protocol + myConfig.HOST;

    /* Service without oAuth token */

    this.authenticate = function (data) {
        return $http.post(serviceUrlBase + "/DbdgWS/LogInAuth.svc/LogInServiceAuth", data);
    };

    this.logoutMember = function (data) {
        var url = serviceUrlBase + "/DbdgWS/LogInAuth.svc/LogOut";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    }


    this.forgotPassword = function (data) {
        return $http.post(serviceUrlBase + "/DbdgWS/LogInAuth.svc/ForgotPassword", data);
    };


    /* 
     * Service with oAuth token
     * User Permits Service 
     */

    this.getAllPermits = function (data) {
        var url = serviceUrlBase + "/DbdgWS/Permits.svc/GetAllPermits";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    };

    this.savePermits = function (data) {
        var url = serviceUrlBase + "/DbdgWS/Permits.svc/SavePermit";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    };


    this.filterPemits = function (data) {
        var url = serviceUrlBase + "/DbdgWS/Permits.svc/FilterPermits";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    };

    this.deletePemits = function (data) {
        var url = serviceUrlBase + "/DbdgWS/Permits.svc/DeletePermit";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    };


    this.pemitsFileUpload = function (file, id) {
        var url = serviceUrlBase + "/DbdgWS/Permits.svc/Upload/" + id;
        var method = 'POST';
        return $http({
            method: method,
            data: file,
            params: authFactory.getOauthParams(url, method),
            url: url,
            transformRequest: angular.identity,
            headers: {
                'Content-Type': 'undefined',
                'Authorization': authFactory.generateAuthHeader(url, method)
            }

        });
    };


    this.getPemitsFiles = function (data) {
        var url = serviceUrlBase + "/DbdgWS/Permits.svc/GetUploadFilesByPermitId/" + data.permitId;
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), ''));
    };
    
    
    this.GetBuilderContact = function (data) {
        var url = serviceUrlBase + "/DbdgWS/Permits.svc/GetBuilderContactByBuilder/" + data;
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), ''));
    };
    
    
    /* 
     * Service with oAuth token
     * User Permit Permission Service 
     */

    /*this.getPermitBuilders = function () {
        var url = serviceUrlBase + "/DbdgWS/Permits.svc/GetAllBuilders";
        var method = 'GET';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method)));
    };*/
    
    this.GetPermissionFilters = function () {
        var url = serviceUrlBase + "/DbdgWS/Permits.svc/GetPermissionFilters";
        var method = 'GET';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method)));
    };
    

    this.getPermitsByBuilderId = function (data) {
        var url = serviceUrlBase + "/DbdgWS/Permits.svc/GetPermitsByBuilder/" + data.id;
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), ''));
    };

    this.getPermitPermissionByPagination = function (data) {
        var url = serviceUrlBase + "/DbdgWS/Permits.svc/GetPermitPermissionByFilter";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    }

    this.saveUserPermitPermission = function (data) {
        var url = serviceUrlBase + "/DbdgWS/Permits.svc/SaveUserPermitPermission";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    }


    /* 
     * Service with oAuth token
     * User Management Service 
     */

    this.getAllUserManageMembers = function () {
        var url = serviceUrlBase + "/DbdgWS/UserManagement.svc/GetAllMembers";
        var method = 'GET';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method)));
    }

    this.getUserManageMembersByRole = function (data) {
        var url = serviceUrlBase + "/DbdgWS/UserManagement.svc/GetMembersByRole/" + data.roleId;
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), ''));
    }

    this.addUserManageMembers = function (data) {
        var url = serviceUrlBase + "/DbdgWS/UserManagement.svc/SaveMember";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    }

    this.editUserManageMembers = function (data) {
        var url = serviceUrlBase + "/DbdgWS/UserManagement.svc/GetMemberById/" + data.id;
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), ''));
    }

    this.deleteUserManageMembers = function (data) {
        var url = serviceUrlBase + "/DbdgWS/UserManagement.svc/DeleteMember";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    }

    this.getMembersByPagination = function (data) {
        var url = serviceUrlBase + "/DbdgWS/UserManagement.svc/GetMembersByPaging";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    }

    this.validateUserAndEmailValue = function (data) {
        var url = serviceUrlBase + "/DbdgWS/UserManagement.svc/EmailIsExist/" + data.UserName;
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), ''));
    }

    /* 
     * Service with oAuth token
     * Builder Management Service 
     */


    this.getAllBuilderManageMembers = function (data) {
        var PageCount = data.PageCount;
        var Limit = data.Limit;
        var url = serviceUrlBase + "/DbdgWS/BuilderManagement.svc/GetAllBuilders/" + PageCount + "/" + Limit
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method)));
    }

    this.saveBuilder = function (data) {
        var url = serviceUrlBase + "/DbdgWS/BuilderManagement.svc/SaveBuilder";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    }

    this.getBuilderById = function (data) {
        var url = serviceUrlBase + "/DbdgWS/BuilderManagement.svc/GetBuilderById/" + data.id;
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), ''));
    }

    this.deleteBuilder = function (data) {
        var url = serviceUrlBase + "/DbdgWS/BuilderManagement.svc/DeleteBuilder/" + data.id;
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), ''));
    }


    /* 
     * Service with oAuth token
     * Reports Management Service 
     */

    this.getAllReportsMembers = function () {
        var url = serviceUrlBase + "/DbdgWS/Reports.svc/GetAuditReports";
        var method = 'GET';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method)));
    }

    this.getMembersByBuilder = function (data) {
        var url = serviceUrlBase + "/DbdgWS/Reports.svc/GetMembersByBuilder/" + data.id;
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), ''));
    }

    this.getReportsMembersByPagination = function (data) {
        var url = serviceUrlBase + "/DbdgWS/Reports.svc/AuditReportsByPagination";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    }


    /* 
     * Service with oAuth token
     * Lookup Service 
     */

    this.getLookUpDetails = function () {
        var url = serviceUrlBase + "/DbdgWS/LookUp.svc/GetLookUpDetails";
        var method = 'GET';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method)));
    }

    this.getLookupDetailsByPaging = function (data) {
        var PageCount = data.PageCount;
        var Limit = data.Limit;
        var url = serviceUrlBase + "/DbdgWS/LookUp.svc/GetLookupDetailsByPaging/" + PageCount + "/" + Limit
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    }

    this.saveLookupDetail = function (data) {
        var url = serviceUrlBase + "/DbdgWS/LookUp.svc/SaveLookupDetail";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    }


    /* 
     * Service with oAuth token
     * Dashboard Service 
     */

    this.getDashBoardsDetailsByFilter = function (data) {
        var url = serviceUrlBase + "/DbdgWS/DashBoard.svc/GetClientDetails";
        var method = 'POST';
        return $http(requestFormation(method, authFactory.getOauthParams(url, method), url, authFactory.generateAuthHeader(url, method), data));
    }


    /*
     * Http API formation function for Oauth Query params
     */

    function requestFormation(method, params, url, header, data) {
        if (method == 'GET') {
            return {
                params: params,
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': header
                }
            }
        } else {
            return {
                method: method,
                data: data,
                params: params,
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': header
                }
            }
        }
    }

});