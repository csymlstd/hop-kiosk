var my = angular.module('hop.c.my', ['ui.router','ngStorage', 'ngFileUpload', 'mm.foundation.modal']);



my.config(function($stateProvider, $httpProvider, $urlRouterProvider) {
  $stateProvider
  .state('my', {
    url: '/my',
    authenticate: true,
    views: {
      'main': {
        templateUrl: 'views/my/index.html',
        controller: 'myController'
      },
      'tastedBrews@my': {
        templateUrl: 'views/my/partials/tasted-brews.html',
        controller: 'myBrewsController'
      }
    }
  })
  .state('welcome', {
    url: '/welcome',
    authenticate: true,
    views: {
      'main': {
        templateUrl: 'views/my/welcome.html',
        controller: 'welcomeController'
      }
    }
  })
  .state('my.brews.info', {
    url: '/:userbrew_id',
    authenticate: true,
    onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
      $modal.open({
        templateUrl: 'views/my/partials/brew-info.html',
        controller: 'my.brewInfoController',
        windowClass: ''
      }).result.finally(function(){
        $state.go('^.^');
      })
    }]
  })
  .state('my.brews', {
    url: '/brews',
    authenticate: true,
    abstract: true,
  });
});

my.directive('dropdown', [function() {
  return {
    restrict: 'C',
    link: function(scope, elem, attrs) {
      $(elem).dropdown();
    }
  }
}]);

my.directive('data-progress', [function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      $(elem).progress();
    }
  }
}]);

my.controller('myController', function($scope, $rootScope, $http, Auth, BrewService, Config, Api) {
  $scope.loading = {
    round: true,
    brewsList: true
  };

  var config = Api.getConfig();
  $scope.userBrews = [];
  var tastedCount = 0;

  Api.pull('users/brews', { populate: 'true' })
  .then(function(data) {
    return Promise.all(data.map(function(row) {
        var brew_id = row.brew._id;
        console.log(brew_id);
        return Api.get('users/brews/tasted', { brew: brew_id, user: $rootScope.user._id })
          .then(function(tasted) {
            row.tasted = tasted;
            tastedCount =  tastedCount + tasted.length;
            $scope.userBrews.push(row);
          })
    }));
  })
  .then(function() {
      $scope.loading.brewsList = false;
      var total = $scope.userBrews.length;
      $scope.roundData = {
        total: tastedCount,
        complete: (tastedCount / config.club.rounds.brewsPer) * 100.0
      }
      $scope.loading.round = false;
  }).catch(function(err) {
    console.log(err);
  });


  $scope.unlinkSocial = function(service) {
    $scope.error = false;
    var updateUser = {
      oauth: {
        [service]: false
      }
    };

    Auth.update(updateUser)
      .then(function(data) {
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


  // $scope.favoritesOnly = false;
  //
  // $scope.favoriteBrews = function(){
  //     return function(brew) {
  //       console.log($scope.favoritesOnly);
  //       if(brew.favorite == $scope.favoritesOnly == true) {
  //         return true;
  //       } else if($scope.favoritesOnly == false) {
  //         return true;
  //       }
  //     }
  // }

});

my.controller('welcomeController', function($scope, $state, $rootScope, Auth) {

  $scope.title = 'Welcome';

  $scope.form = Auth.getUser();

  $scope.welcome = function() {
    $scope.error = false;
    $scope.disabled = false;

    Auth.update($scope.form)
      .then(function(data) {
        swal({
          title: 'Welcome to the Club!',
          type: 'success',
          timer: 1000,
          showConfirmButton: false
        });
        $state.go('my');
      })
      .catch(function(data) {
        $scope.error = true;
        $scope.errorMessage = data.message;
        $scope.disabled = false;
      })
  }

});

my.controller('myBrewsController', function($scope, $stateParams, $rootScope, $http, BrewService) {
  $scope.title = 'Your Brews';

  $scope.query = {
    search: '',
    round: { name: $rootScope.user.club.round, id: $rootScope.user.club.round },
    rounds: [
      { name: 'All Tasted', id: false },
      { name: $rootScope.user.club.round + ' (Current)', id: $rootScope.user.club.round }
    ],
    sort: {
      by: 'tasted',
      reverse: true,
    }
  }

  // Generate list of previous rounds for sorting options.
  for(i = 1;i < $rootScope.user.club.round && i > 0; i++) {
    var thisRound = $rootScope.user.club.round - 1;
    $scope.query.rounds.push({ name: thisRound, id: thisRound });
    thisRound--;
  }

  $scope.tasted = function(element) {
    if(element.tasted !== undefined) {
      return element.tasted.length > 0 ? true : false;
    }
    return false;
  }

  $scope.sortBrews = function(element) {

    switch ($scope.query.sort.by) {
      case 'name':
        return element.brew.name;
        break;
      case 'tasted':
        $scope.query.reverse = true;
        return element.tasted[0].tasted;
        break;
    }
  }

  $scope.roundOnly = function(element) {
    // @todo loop through every tasted brew
    // maybe not use embedded tasted info, cross check a diff array
    if($scope.query.round.id !== false) {
      return element.tasted[0].round == $scope.query.round.id ? true : false;
    }

    return true;
  }

  $scope.favorite = function(element) {
    return element.favorite ? true : false;
  }

  $scope.searchFor = function (element) {
      return (angular.lowercase(element.brew.name).indexOf(angular.lowercase($scope.query.search) || '') !== -1 ||
              angular.lowercase(element.brew.style).indexOf(angular.lowercase($scope.query.search) || '') !== -1 ||
              angular.lowercase(element.brew.brewer.name).indexOf(angular.lowercase($scope.query.search) || '') !== -1);
  };


});

my.controller('my.brewInfoController', function($scope, $stateParams, $rootScope, $http, Api) {
  var userbrew_id = $stateParams.userbrew_id;

  var userbrew = {}
  Api.get('users/brews', { _id: userbrew_id })
  .then(function(data) {
    userbrew = data[0];
    var brew_id = userbrew.brew;
    return Api.get('brews', { _id: brew_id })
      .then(function(brew) {
        userbrew.brew = brew;
        return Api.get('brewers', { brewer: brew.brewer });
      })
      .then(function(brewer) {
        userbrew.brew.brewer = brewer;
        $scope.$apply(function() { $scope.userbrew = userbrew; })
      })
  })


});
