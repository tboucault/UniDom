angular.module('iot', ['ionic','chart.js'])

.config(function($stateProvider, $urlRouterProvider,$httpProvider) {
      delete $httpProvider.defaults.headers.common['X-Requested-With'];

  $stateProvider
	.state('router.devices', {
      url: "/devices",
      views: {
        'menuContent' :{
          controller: 'devicesCtrl',
          templateUrl: "templates/devices.html"
        }
      }
    })
	.state('router.device', {
      url: "/device",
      views: {
        'menuContent' :{
          templateUrl: "templates/device-single.html"
        }
      }
    })
	.state('router.users', {
      url: "/users",
      views: {
        'menuContent' :{
          templateUrl: "templates/users.html"
        }
      }
    })
	.state('intro', {
      url: "/intro",
      templateUrl: "templates/intro.html",
	  controller: 'LoginCtrl'
    })
  $urlRouterProvider.otherwise("/intro");
})

.directive('wrapOwlcarousel', function () {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            var options = scope.$eval($(element).attr('data-options'));
            $(element).owlCarousel(options);
        }
    };
})


.run(function ($rootScope, $state, AuthService, AUTH_EVENTS, $ionicPopup) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
    if (!AuthService.isAuthenticated()) {
      //console.log(next.name);
      if (next.name !== 'intro') {
        event.preventDefault();
        var alertPopup = $ionicPopup.alert({
          title: 'Vous ne pouvez pas accéder à cette page',
          template: 'Veuillez vous reconnecter'
        });
        $state.go('intro');
      }
    }
  });
});
