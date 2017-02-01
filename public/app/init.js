var modules = [
  'hop.config', 'hop.services.api',
  'hop.services.auth','hop.services.brews','hop.services.files',
  'hop.c','hop.c.my','hop.c.account','hop.c.brews','hop.c.admin',
  'ui.router','ngStorage', 'angular-jwt', 'angularMoment', 'angular-loading-bar', 'ngAnimate'
];
// create the module
var hop = angular.module('hop', modules);

// configure our routes
hop.config(function($stateProvider, $httpProvider, $sessionStorageProvider, $localStorageProvider, $locationProvider, $urlRouterProvider, jwtOptionsProvider) {

    $localStorageProvider.setKeyPrefix('hop-');
    $sessionStorageProvider.setKeyPrefix('hop-');

    $httpProvider.interceptors.push('ConnectionInterceptor');
    $httpProvider.interceptors.push('TokenInterceptor');

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('setup', {
        url: '/setup',
        views: {
          'main': {
            templateUrl: 'views/setup.html',
            controller: 'setupController'
          }
        }
      })
      .state('home', {
        url: '/',
        //controller: 'mainController',
        views: {
          'main': {
            templateUrl: 'views/home.html',
          },

          'sidebar@home': {
            templateUrl: 'views/partials/login.html',
            controller: 'loginController'
          }
        }
      })
      .state('login/forgot', {
        url: '/login/forgot',
        views: {
          'main': {
            templateUrl: 'views/password.html',
            controller: 'passwordController'
          }
        }
      })
      .state('logout', {
        url: '/logout',
        authenticate: true,
        views: {
          'main': {
            controller: 'logoutController'
          }
        }

      })
      .state('register', {
        url: '/register',
        views: {
          'main': {
            templateUrl: 'views/register.html',
            controller: 'registerController'
          }
        }
      });

      $locationProvider.html5Mode(true);

});

hop.run(function($rootScope, $window, $localStorage, $sessionStorage, $location, $timeout, $state, $stateParams, Auth, Api, BrewService, Config) {
  Api.init();
  Config.init();
  Auth.init();
  BrewService.init();

  //Make state available to the view
  //Useful for setting menu active states
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  // (function(gd, gs, id){
  //    var j, gjs = gd.getElementsByTagName(gs)[0];
  //    if (gd.getElementById(id)) {return;}
  //    j = gd.createElement(gs); j.id = id;
  //    j.async = true;
  //    j.src = "//apis.google.com/js/platform.js";
  //    gjs.parentNode.insertBefore(j, gjs);
  //  }(document, 'script', 'google-platformjs'));

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

  //Facebook Init
  $window.fbAsyncInit = function() {
    FB.init({
      appId: '634486536729183',
      xfbml: true,
      version: 'v2.8'
    });
  }

  // gapi.load('auth2', function() {
  //   gapi.auth2.init({
  //      client_id: '164235841900-8ur0qe58m1t20f7agakuf1a8tpsdjni8.apps.googleusercontent.com',
  //      scopes: 'profile email'
  //    });
  // });





  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if((!$localStorage.config || !Config.get('url') || !Config.get('store')) && toState.name != 'setup') {
      event.preventDefault();
      $state.go('setup');
    } else if(toState.name != 'welcome' && toState.name != 'logout' && Auth.isLoggedIn() && $rootScope.user.new) {
      event.preventDefault();
      $state.go('welcome');
    } else if(toState.name == 'home' && Auth.isLoggedIn()) {
      event.preventDefault();
      $state.go('my');
    } else if(toState.name == 'welcome' && Auth.isLoggedIn() && !$rootScope.user.new) {
      event.preventDefault();
      $state.go('my');
    } else {
      if(Auth.isLoggedIn() && Auth.isTokenExpired()) {
        Auth.refreshToken().then(function(refreshed) {
          if(!refreshed) {
            event.preventDefault();
            swal({
              type: 'error',
              title: 'Please Login Again',
              text: 'Your session has expired.',
              timer: 1500,
              showConfirmButton: false
            });
            Auth.logout();
            $state.go('home');
          }
        });
      }

      if(!Auth.checkPermissionForView(toState)) {
        event.preventDefault();
        swal({
          type: 'error',
          title: 'Oops!',
          text: 'You are\'t allowed to do that.',
          timer: 1500,
          showConfirmButton: false
        });
        if(fromState.name == ''){
          $state.go('home');
        }
      }
    }
  });
});
