var account = angular.module('hop.c.account', ['ui.router','ngStorage', 'ngFileUpload']);

account.config(function($stateProvider, $httpProvider, $urlRouterProvider) {
  $stateProvider
  .state('account', {
    url: '/account',
    authenticate: true,
    views: {
      'main': {
        templateUrl: 'views/account/index.html',
        controller: 'my.account',
      },
      'settings@account': {
        templateUrl: 'views/account/account.html',
        controller: 'my.account',
      }
    }
  })
  .state('account.profile', {
    url: '/profile',
    authenticate: true,
    views: {
      'settings': {
        templateUrl: 'views/account/profile.html',
        controller: 'my.profile',
      }
    }
  })
  .state('account.social', {
    url: '/social',
    authenticate: true,
    views: {
      'settings': {
        templateUrl: 'views/account/social.html',
        controller: 'my.social',
      }
    }
  })
  .state('account.cards', {
    url: '/cards',
    authenticate: true,
    views: {
      'settings': {
        templateUrl: 'views/account/cards.html',
        controller: 'my.cards',
      }
    }
  })
  // .state('account.profile', {
  //   url: '/profile',
  //   authenticate: true,
  //   onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
  //     $modal.open({
  //       templateUrl: 'views/my/partials/edit-profile.html',
  //       controller: 'my.profile',
  //       windowClass: 'animated zoomIn',
  //     }).result.finally(function(){
  //       $state.go('^');
  //     })
  //   }]
  // })
});


account.controller('my.account', function($scope, $rootScope, $http, Auth) {
  $scope.title = 'Settings';
});

account.controller('my.profile', function($scope, $rootScope, $http, Auth, BrewService, Upload) {

  $scope.updateUser = $rootScope.user;

  $scope.dismiss = function() {
    $scope.$dismiss();
  }

  //
  // $scope.upload = function(file) {
  //   console.log('Uploading');
  //   Upload.upload({
  //     url: 'http://h.csymlstd.xyz:5000/api/files/upload',
  //     data: {file: file}
  //   }).then(function(response) {
  //       $scope.progress = false;
  //       console.log(response.data);
  //   }, function(response){ // catch error
  //       console.log({ error: 'Error Uploading' });
  //   }, function(evt) {
  //      $scope.progress = true;
  //      var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
  //      console.log('Progress: '+ progressPercentage + '% ' + evt.config.data.file.name);
  //   });
  //
  // }

  // $scope.upload = function(file) {
  //     console.log(file);
  //       // Upload.upload({
  //       //     url: 'http://h.csymlstd.xyz:5000/api/files/upload',
  //       //     data: { file: file }
  //       // })
  //   };

  $scope.update = function() {
    //initial values
    $scope.error = false;
    $scope.disabled = false;

    // $scope.upload($scope.updateUser.photo);

    //call login from service
    Auth.update($scope.updateUser)
      .then(function(data) {
        swal({
          title: 'Profile Saved Successfully!',
          type: 'success',
          timer: 1000,
          showConfirmButton: false
        });
        //$scope.message = { type: 'success', text: 'Account successfully created!'; }
        $scope.disabled = false;
        $scope.updateUser = $rootScope.user;
        //$scope.$dismiss();
      })
      .catch(function(data) {
        $scope.error = true;
        $scope.errorMessage = data.message;
        $scope.disabled = false;
      })
  }
});

my.controller('my.social', function($scope, $rootScope, $http, Auth, BrewService) {

  $scope.title = 'Social Accounts';

  $scope.unlinkSocial = function(service) {
    $scope.error = false;
    var updateUser = {
      oauth: {
        [service]: false
      }
    };

    swal({
      title: "Are you sure you want to remove connection?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Continue",
      closeOnConfirm: false
    }, function(){
      Auth.update(updateUser)
        .then(function(data) {
          console.log(data);
          swal({
            title: 'Service Unlinked!',
            type: 'success',
            timer: 1000,
            showConfirmButton: false
          });
        })
        .catch(function(data) {
          $scope.error = true;
        })
    });
  }

  $scope.linkSocial = function(service) {
    $scope.error = false;
    switch(service) {
      case 'facebook':
        Auth.loginFacebook()
          .then(function() {
            swal({
              title: 'Facebook Linked!',
              type: 'success',
              timer: 1000,
              showConfirmButton: false
            });
          })
          .catch(function(data) {
            swal({
              title: data.error,
              text: data.message,
              type: 'error',
              showConfirmButton: true
            });
            $scope.errorMessage = data;
          })
        break;
      case 'google':
        Auth.loginGoogle()
          .then(function() {
            swal({
              title: 'Google Linked!',
              type: 'success',
              timer: 1000,
              showConfirmButton: false
            });
          })
          .catch(function(data) {
            swal({
              title: data.error,
              text: data.message,
              type: 'error',
              showConfirmButton: true
            });
            // $scope.error = true;
            $scope.errorMessage = data;
          })
        break;
    }
  }
});

account.controller('my.cards', function($scope, $rootScope, $http, Auth, BrewService, Upload) {

  $scope.updateUser = $rootScope.user;

  $scope.update = function() {
    //initial values
    $scope.error = false;
    $scope.disabled = false;

    // $scope.upload($scope.updateUser.photo);

    //call login from service
    Auth.update($scope.updateUser)
      .then(function(data) {
        swal({
          title: 'Profile Saved Successfully!',
          type: 'success',
          timer: 1000,
          showConfirmButton: false
        });
        //$scope.message = { type: 'success', text: 'Account successfully created!'; }
        $scope.disabled = false;
        $scope.updateUser = $rootScope.user;
        //$scope.$dismiss();
      })
      .catch(function(data) {
        $scope.error = true;
        $scope.errorMessage = data.message;
        $scope.disabled = false;
      })
  }
});
