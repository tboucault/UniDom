angular.module('iot')

    .controller('addUser', function ($rootScope, $timeout, $scope, $http, API_ENDPOINT, AuthService, $ionicPopup, $ionicLoading, $state, $ionicSlideBoxDelegate) {

        $scope.setFormScope = function (scope) {
            this.formScope = scope;
        }
        $scope.newuser = {};
        $scope.userSubmit = function () {
            if (!$scope.newuser.name) {
                alert('Veuillez rentrer un identifiant valide');
                return;
            }
            if (!$scope.newuser.password) {
                alert('Veuillez rentrer un mot de passe valide');
                return;
            }
            if (!$scope.newuser.password2) {
                alert('Veuillez ressaisir votre mot de passe');
                return;
            }
            if ($scope.newuser.password != $scope.newuser.password2) {
                alert('Les mots de passe ne correspondent pas');
                return;
            }
            if (!$scope.newuser.email) {
                alert('Veuillez rentrer un email valide');
                return;
            }
            if (!$scope.newuser.access_level) {
                alert("Veuillez choisir un droit d'accès");
                return;
            }
            AuthService.register($scope.newuser).then(function (msg) {
                $rootScope.userslistlength = $rootScope.userslistlength + 1;
                $ionicLoading.show({
                    template: msg
                });
                $timeout(function () {
                    $ionicLoading.hide();
                    $state.go('router.dashboard.home');
                }, 500);
            }, function (errMsg) {
                $ionicLoading.show({
                    template: errMsg
                });
                $timeout(function () {
                    $ionicLoading.hide();
                }, 500);
            });
        };
    })
// ##############################################################################################################

    .controller('devicesCtrl', function ($scope, $ionicSideMenuDelegate, $ionicPopover, $state, $timeout, AuthService, API_ENDPOINT, $http, $ionicPopup, $ionicLoading, $rootScope) {

        $scope.isDisabledstop = true;

        // ################################################################
        // #####               LAMPE ZWAVE                            #####
        // ################################################################
        // ##### on allume la lampe #####
        $scope.on = function () {
            //envoi de la commande a domoticz
          $http.get('http://'+$rootScope.domoticzip+':'+$rootScope.domoticzport+'/json.htm?type=command&param=switchlight&idx='+$scope.device.idx+'&switchcmd=Set%20Level&level='+$scope.actions[0].value).then(function (resultt) {
                $scope.resultat = resultt.data.status;//query du resultat
                console.log($scope.resultat);
            });

            /*$http.jsonp('http://10.23.12.53:8080/json.htm?type=devices&rid=1?callback=JSON_CALLBACK').then(function (resultt) {
                $scope.resultat = resultt.data.status;//query du resultat
                console.log(resultt);
                console.log("jsonp ok");
            });*/


            $ionicLoading.show({
                template: "Commande executée avec succès"
            });
            $timeout(function () {
                $ionicLoading.hide();
                $rootScope.isDisabled=false;//range actif
                $rootScope.isDisabledon=true;//button on desactivé
                $rootScope.isDisabledoff=false;//button off activé
                $scope.actions[0].valueonoff="ON";//status ON donc dans le label on affiche le %
            }, 500);
        }
        // ###########################

        // ##### On etein la lampe #####
        $scope.off = function () {
            //envoi de la commande a domoticz
            $http.get('http://'+$rootScope.domoticzip+':'+$rootScope.domoticzport+'/json.htm?type=command&param=switchlight&idx='+$scope.device.idx+'&switchcmd=Off').then(function (resultt) {

                $scope.resultat = resultt.data.status;//query du resultat
            });

            $ionicLoading.show({
                template: "Commande executée avec succès"
            });
            $timeout(function () {
                $ionicLoading.hide();
                $scope.actions[0].valueonoff="OFF";//status OFF donc dans le label on affiche OFF et non le %age
                $rootScope.isDisabled=true;//range désactivé
                $rootScope.isDisabledon=false;//button on actif
                $rootScope.isDisabledoff=true;//button off desactivé
            }, 500);
        }
        // ###########################

        // ##### variation de la lampe à une certaine valeur 0%<valeur<100% #####
        $scope.dimmer = function () {

            //envoi de la commande a domoticz
            $http.get('http://'+$rootScope.domoticzip+':'+$rootScope.domoticzport+'/json.htm?type=command&param=switchlight&idx='+$scope.device.idx+'&switchcmd=Set%20Level&level='+$scope.actions[0].value).then(function (resultt) {

                $scope.resultat = resultt.data.result[0].Data;//query du resultat
            });

            $ionicLoading.show({
                template: "Commande executée avec succès"
            });
            $timeout(function () {
                $ionicLoading.hide();
                $scope.actions[0].valueonoff="ON";//status ON donc dans le label on affiche le %
            }, 500);
        }
        // ################################################################

    })
 // ##############################################################################################################