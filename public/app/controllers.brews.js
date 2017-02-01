var b = angular.module('hop.c.brews', ['ui.router','ngStorage']);


b.config(function($stateProvider, $httpProvider, $urlRouterProvider) {
  $stateProvider
  .state('brews', {
    url: '/brews',
    authenticate: true,
    views: {
      'main': {
        templateUrl: 'views/brews/finder.html',
        controller: 'brews'
      }
    },
    // onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
    //   $modal.open({
    //     templateUrl: 'views/brews/finder.html',
    //     controller: 'brewsController',
    //     windowClass: 'animated',
    //   }).result.finally(function(){
    //     $state.go('^');
    //   })
    // }]
  }).state('brews.info', {
    url: '/:storebrew_id',
    authenticate: true,
    onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
      $modal.open({
        templateUrl: 'views/brews/partials/info.html',
        controller: 'brews.info',
        windowClass: ''
      }).result.finally(function(){
        console.log('Closed!');
        $state.go('^');
      })
    }]
  });
});

b.controller('brews.info', function($scope, $stateParams, $rootScope, $http, Api, Config) {
  $scope.loading = {
    info: true
  }

  var storebrew_id = $stateParams.storebrew_id;
  var storebrew;
  Api.get('stores/'+Config.get('store')+'/brews',{ _id: storebrew_id })
  .then(function(data) {
    storebrew = data[0];
    var brew_id = storebrew.brew;
    return Api.get('brews', { _id: brew_id })
  })
  .then(function(brew) {
    storebrew.brew = brew;
    return Api.get('brewers', { _id: storebrew.brew[0].brewer });
  })
  .then(function(brewer) {
    storebrew.brew[0].brewer = brewer;
    $scope.$apply(function() { $scope.info = storebrew; $scope.loading.info = false; });
  });
});


b.controller('brews', function($scope, $stateParams, $rootScope, $http, Api, Config) {
  $scope.title = 'Beers on Tap';

  $scope.loading = { brewsList: true }

  $scope.storeBrews = [];

    Api.get('stores/'+Config.get('store')+'/brews')
    .then(function(data) {
      return Promise.all(data.map(function(row) {
          var brew_id = row.brew;
          var brewer_id;
          return Api.get('brews', { _id: brew_id })
            .then(function(brew) {
              row.brew = brew;
              brewer_id = brew[0].brewer;
              return Api.get('brewers', { _id: brewer_id });
            })
            .then(function(brewer) {
              row.brew[0].brewer = brewer;
              $scope.$apply(function() { $scope.storeBrews.push(row); })
            })
      }));
    })
    .then(function(data) {
      $scope.$apply(function() {
        $scope.loading.brewsList = false;
      })

    });

  $scope.query = {
    search: '',
    round: { name: $rootScope.user.club.round, id: $rootScope.user.club.round },
    rounds: [
      { name: 'All Tasted', id: false },
      { name: $rootScope.user.club.round + ' (Current)', id: $rootScope.user.club.round }
    ],
    sort: {
      by: 'name',
      reverse: true,
    }
  }

  // // Generate list of previous rounds for sorting options.
  // for(i = 1;i < $rootScope.user.club.round && i > 0; i++) {
  //   var thisRound = $rootScope.user.club.round - 1;
  //   $scope.query.rounds.push({ name: thisRound, id: thisRound });
  //   thisRound--;
  // }
  //
  // $scope.tasted = function(element) {
  //   return element.tasted.length > 0 ? true : false;
  // }

  $scope.sortBrews = function(element) {

    switch ($scope.query.sort.by) {
      case 'name':
        return element.brew[0].name;
        break;
      // case 'tasted':
      //   $scope.query.reverse = true;
      //   return element.tasted[0].tasted;
      //   break;
    }
  }
  //
  // $scope.roundOnly = function(element) {
  //   // @todo loop through every tasted brew
  //   // maybe not use embedded tasted info, cross check a diff array
  //   if($scope.query.round.id !== false) {
  //     return element.tasted[0].round == $scope.query.round.id ? true : false;
  //   }
  //
  //   return true;
  // }

  $scope.favorite = function(element) {
    return element.favorite ? true : false;
  }

  $scope.searchFor = function (element) {
      return (angular.lowercase(element.brew[0].name).indexOf(angular.lowercase($scope.query.search) || '') !== -1 ||
              //angular.lowercase(element.brew[0].style).indexOf(angular.lowercase($scope.query.search) || '') !== -1 ||
              angular.lowercase(element.brew[0].brewer[0].name).indexOf(angular.lowercase($scope.query.search) || '') !== -1);
  };


});
