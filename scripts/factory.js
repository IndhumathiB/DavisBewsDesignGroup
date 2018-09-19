'use strict';
angular.module('DBDG').factory('authFactory',function($cookies,$rootScope,$q,$routeParams,myConfig) {
  var authFact = {};

  authFact.isAuthenticated = function(){
      if($cookies.get('ConsumerKey') && $cookies.get('ConsumerSecret') && $cookies.get('Id') && $cookies.get('LogId') && $cookies.get('Role') && $cookies.get('RoleName') && $cookies.get('UserName') && $cookies.getObject('RoleAuthorization')){
          return true;
      }
  }
  
  
  authFact.dynamicRoute = function(){
      
      var menuList = JSON.parse($cookies.getObject('RoleAuthorization'));
        for (var i = 0; i < menuList.length; i++) {
            if (menuList[i].MenuName == 'Dashboard') {
                menuList[i].urlName = 'dashboard';
                if ($routeParams.menuName == menuList[i].urlName) {
                    menuList[i].isActiveClass = 'current';
                } else {
                    menuList[i].isActiveClass = '';
                }
            } else if (menuList[i].MenuName == 'Permit Management') {
                menuList[i].urlName = 'permits';
                if ($routeParams.menuName == menuList[i].urlName) {
                    menuList[i].isActiveClass = 'current';
                } else {
                    menuList[i].isActiveClass = '';
                }
            } else if (menuList[i].MenuName == 'Permit Permission') {
                menuList[i].urlName = 'permission';
                if ($routeParams.menuName == menuList[i].urlName) {
                    menuList[i].isActiveClass = 'current';
                } else {
                    menuList[i].isActiveClass = '';
                }
            } else if (menuList[i].MenuName == 'User Management') {
                menuList[i].urlName = 'usermanagement';
                if ($routeParams.menuName == menuList[i].urlName) {
                    menuList[i].isActiveClass = 'current';
                } else {
                    menuList[i].isActiveClass = '';
                }
            } else if (menuList[i].MenuName == 'Builder Management') {
                menuList[i].urlName = 'buildermanagement';
                if ($routeParams.menuName == menuList[i].urlName) {
                    menuList[i].isActiveClass = 'current';
                } else {
                    menuList[i].isActiveClass = '';
                }
            } else if (menuList[i].MenuName == 'Reports') {
                menuList[i].urlName = 'reports';
                if ($routeParams.menuName == menuList[i].urlName) {
                    menuList[i].isActiveClass = 'current';
                } else {
                    menuList[i].isActiveClass = '';
                }
            } else if (menuList[i].MenuName == 'Settings') {
                menuList[i].urlName = 'lookupsetting';
                if ($routeParams.menuName == menuList[i].urlName) {
                    menuList[i].isActiveClass = 'current';
                } else {
                    menuList[i].isActiveClass = '';
                }
            }
        }
      
      return menuList;
  }
    
    
  authFact.setUserDetails = function(cookiesData) {
    var defer = $q.defer();
    $cookies.put('ConsumerKey', cookiesData.ConsumerKey);
    $cookies.put('ConsumerSecret', cookiesData.ConsumerSecret);
    $cookies.put('Id', cookiesData.Id);
    $cookies.put('LogId', cookiesData.LogId);
    $cookies.put('Role', cookiesData.Role);  
    $cookies.put('RoleName', cookiesData.RoleName);
    $cookies.put('UserName', cookiesData.UserName);  
    $cookies.putObject('RoleAuthorization', JSON.stringify(cookiesData.RoleAuthorization));
    defer.resolve(true);
    return defer.promise; 
  };
    
  authFact.getUserKey = function() {
    if ($cookies.get('ConsumerKey')) {
      authFact.Key = $cookies.get('ConsumerKey');
      return authFact.Key;
    } else {
      return false;
    }
  };
    
  authFact.removeUserDetails = function() {
   $cookies.remove('ConsumerKey');
   $cookies.remove('ConsumerSecret');
   $cookies.remove('Id');
   $cookies.remove('LogId');
   $cookies.remove('Role');
   $cookies.remove('RoleName');
   $cookies.remove('UserName');
   $cookies.remove('RoleAuthorization');
   /*$rootScope.$emit("cookieRemoved",true); */         
  };    
    
 /**************Oauth params***************/
 
  authFact.getOauthParams = function(url,method){
    var serviceUrlBase = url;  
    var consumer_key = $cookies.get('ConsumerKey');
    var consumerSecret = $cookies.get('ConsumerSecret');
    var oAuthDatas = authSignature(consumer_key, consumerSecret, serviceUrlBase,method);
    var authParams = {
            'oauth_consumer_key': oAuthDatas.msgParameters[0][1],
            'oauth_signature_method': oAuthDatas.msgParameters[1][1],
            'oauth_version': oAuthDatas.msgParameters[2][1],
            'oauth_timestamp': oAuthDatas.msgParameters[3][1],
            'oauth_nonce': oAuthDatas.msgParameters[4][1],
            'oauth_signature': oAuthDatas.msgParameters[5][1]
        };
    return authParams;
  };
  
  /*********** Autherization Header *************/
  
  authFact.generateAuthHeader = function(url,method){
    var serviceUrlBase = url;
    var consumer_key = $cookies.get('ConsumerKey');
    var consumerSecret = $cookies.get('ConsumerSecret');     
    var oAuthDatas = authSignature(consumer_key, consumerSecret, serviceUrlBase,method);
    var authorizationHeader = OAuth.getAuthorizationHeader(oAuthDatas.relam, oAuthDatas.msgParameters);
    return authorizationHeader; 
 };
 

  return authFact;

});