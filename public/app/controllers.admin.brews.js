var admin = angular.module('hop.c.admin.brews', ['ui.router', 'ngStorage']);


admin.config(function($stateProvider, $httpProvider, $urlRouterProvider) {
  $stateProvider
  .state('admin.brews', {
    url: '/brews',
    authenticate: true,
    permissions: ['access-administration', 'manage-brews'],
    views: {
      'admin': {
        templateUrl: 'views/admin/brews.html',
        controller: 'admin.brews'
      }
    }
  })
  .state('admin.brews.add', {
    url: '/add',
    authenticate: true,
    permissions: ['access-administration', 'manage-brews'],
    views: {
      'admin@admin': {
        templateUrl: 'views/admin/brews/add.html',
        controller: 'admin.brews.add'
      }
    }
  })
  .state('admin.brews.collect', {
    url: '/collect/:brew_id',
    authenticate: true,
    permissions: ['access-administration', 'manage-brews'],
    onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
      $modal.open({
        templateUrl: 'views/admin/brews/collect.html',
        controller: 'admin.brews.collect',
        windowClass: 'small'
      }).result.finally(function(){
        $state.go('^');
      })
    }]
  })
  .state('admin.brews.edit', {
    url: '/edit/:brew_id',
    authenticate: true,
    permissions: ['access-administration', 'manage-brews'],
    onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
      $modal.open({
        templateUrl: 'views/admin/brews/edit.html',
        controller: 'admin.brews.edit',
        windowClass: 'small'
      }).result.finally(function(){
        $state.go('^');
      })
    }]
  });
});

admin.filter('searchFor', function() {
  return function(elements, field, model) {
    var test = '';
    return elements.filter(function(element) {
      return ((new RegExp(field, 'i')).test(element.name));
    })
  }
})


admin.controller('admin.brews', function($scope, $http, Api, Config) {
  $scope.title = 'Manage Brews';
  $scope.loading = {}

  $scope.brews = []
  $scope.storeBrews = []

  Api.pull('brews', { populate: true }, true)
  .then(function(data) {
    // $scope.$apply(function() { $scope.brews = data; });
    $scope.brews = data;
    return Api.pull('stores/'+Config.get('store')+'/brews', {}, true);
  })
  .then(function(data) {
    // $scope.$apply(function() {
      $scope.storeBrews = data;
      $scope.loading.table = false;
    // });
  })
  .catch(function(err) {
    console.log(err);
  });



  $scope.hasBrew = function(brew) {
    return ($scope.storeBrews.filter(function(b) {
      return b.brew == brew;
    })).length > 0
  }

  $scope.query = {
    search: {
      brew: '',
      brewer: '',
      added: ''
    },
    sort: {
      by: 'brew',
      reverse: true,
    }
  }

  $scope.searchFor = function (element, index) {
      return (angular.lowercase(element.name).indexOf(angular.lowercase($scope.query.search.brew) || '') !== -1);
  };

});

admin.directive('querybrewdb', [function() {
  return {
    restrict: 'A',
    transclude: true,
    link: function(scope, elem, attrs) {
      console.log(elem);
      $(elem).popup({
        popup: '.search-popup',
        position: 'bottom left',
        on: 'click',
        preserve: true,
        hoverable: true,
        delay: {
          show: 0,
          hide: 100,
        }
      });
    }
  }
}]);

admin.controller('admin.brews.add', function($scope, $q, $http, $window) {

  $scope.query = {
    brew: null
  }

  var queryDB = function(name) {
    var deferred = $q.defer();

    $http.get('http://mini.dev:5000/api/db/brews', {
      params: { name: name }
    })
    .success(function (data) {
      if(!data.error){
        console.log('Success Querying Brew DB');
        var brews = data.splice(0, 10);
        $('.search-popup').popup('show');
        deferred.resolve(brews);
      } else {
        console.log('Failed Querying Brew DB');
        console.log(data.error);
        deferred.reject(data);
      }
    })
    .error(function (data) {
      console.log('Error Querying Brew DB');
      console.log(data);
      deferred.reject(data);
    });

    return deferred.promise;
  }

  $scope.searchBrewDb = function() {
    if($scope.query.brew.length > 3) {
      queryDB($scope.query.brew)
      .then(function(data) {
        $scope.brewDbResults = data;
      })
      .catch(function(data) {
        $scope.brewDbResults = data;
      });
    }
  }

  $scope.brewDbResults = [];

  $scope.selectBrew = function(id) {
    var deferred = $q.defer();
    $http.post('http://mini.dev:5000/api/db/brews/'+id)
    .success(function (data) {
      if(!data.error){
        console.log('Success Adding Brew');
        console.log(data);
        deferred.resolve(data);
      } else {
        console.log('Failed Adding Brew');
        console.log(data.error);
        deferred.reject(data);
      }
    })
    .error(function (data) {
      console.log('Error Adding Brew');
      console.log(data);
      deferred.reject(data);
    });

    return deferred.promise;
  }

});

admin.controller('admin.brews.collect', function($scope, $stateParams, Api, Config) {
  var brew_id = $stateParams.brew_id;
  Api.get('brews', { _id: brew_id })
    .then(function(data) {
      console.log(data);
      $scope.$apply(function() {
        $scope.brew = data;
      })
    })

  $scope.dismiss = function() {
    $scope.$dismiss();
  }

  $scope.collect = function(brew_id) {
    Api.create('stores/brews', { brew_id: brew_id, store_id: Config.get('store'), status: 1 })
      .then(function(data) {
        console.log(data);
        $scope.dismiss();
      })
      .catch(function(data) {
        console.log(data);
      });
  }
});

admin.controller('admin.brews.edit', function($scope, $stateParams, Api, Config) {
  var brew_id = $stateParams.brew_id;
  Api.get('brews', { _id: brew_id })
  .then(function(data) {
    console.log(data);
    $scope.$apply(function() {
      $scope.brew = data;
      $scope.updateBrew = data[0];
    })
  })



});
