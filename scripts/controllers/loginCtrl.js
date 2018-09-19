'use strict';
angular.module('DBDG').controller('loginCtrl', function ($scope, $rootScope, $http, $location, $cookies, APIs, authFactory, myConfig) {

    $scope.checkRememberMe = function(){
        if($cookies.get('rememberMe')){
            $scope.rememberMe = true;
            var credentials = $cookies.get('credentials');
            var PassPhrase = myConfig.crypticoSecret;
            var Bits = myConfig.crypticoSecretBit;
            var MattsRSAkey = cryptico.generateRSAKey(PassPhrase, Bits);
            if(credentials){
            var DecryptionResult = cryptico.decrypt(credentials, MattsRSAkey);
            var decrytData = JSON.parse(DecryptionResult.plaintext);
            
            $scope.username = decrytData.username,
            $scope.password = decrytData.password
            }
        }
    };
    
    $scope.signIn = function () {
        var user = {
            "UserName": $scope.username,
            "Password": $scope.password
        };

        if ($scope.rememberMe) {
            $cookies.put('rememberMe',$scope.rememberMe);
            var PassPhrase = myConfig.crypticoSecret;
            var Bits = myConfig.crypticoSecretBit;
            var MattsRSAkey = cryptico.generateRSAKey(PassPhrase, Bits);
            var MattsPublicKeyString = cryptico.publicKeyString(MattsRSAkey);
            var PlainText = JSON.stringify({
                "username": $scope.username,
                "password": $scope.password
            });
            var EncryptionResult = cryptico.encrypt(PlainText, MattsPublicKeyString);
            var CipherText = EncryptionResult.cipher;
            $cookies.put('credentials',CipherText);
        }else{
            $cookies.remove('rememberMe');
            $cookies.remove('credentials');
        }

        if ($scope.username && $scope.password) {

            APIs.authenticate(user).success(function (data, status) {
                if (status === 200) {
                    var promise = authFactory.setUserDetails(data).then(function (data) {
                        $location.path('/' + authFactory.dynamicRoute()[0].urlName);
                    });
                }
            }).error(function (data, status) {
                $scope.notificationAlert(data);
                console.log(data);
            });
        }

    };


    $scope.forgotPassword = function () {
        var forGotData = {
            Email: $scope.userEmail
        };

        APIs.forgotPassword(forGotData).success(function (data, status) {
            $scope.notificationAlert(data);
            console.log(data);
        }).error(function (data, status) {
            $scope.notificationAlert(data);
            console.log(data);
        });
    };

    $scope.cancelForgotPassword = function () {
        $location.path('/');
    };


});