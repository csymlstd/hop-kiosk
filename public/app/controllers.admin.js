var admin = angular.module('hop.c.admin', ['hop.c.admin.brews','hop.c.admin.config','ui.router', 'ngStorage']);


admin.config(function($stateProvider, $httpProvider, $urlRouterProvider) {
  $stateProvider
  .state('admin', {
    url: '/admin',
    authenticate: true,
    permissions: ['access-administration'],
    views: {
      'main': {
        templateUrl: 'views/admin/index.html',
        controller: 'admin'
      },
      'admin@admin': {
        templateUrl: 'views/admin/dashboard.html',
        controller: 'admin.dashboard'
      }
    }
  })
  .state('scan', {
    url: '/scan',
    authenticate: true,
    permissions: ['access-administration'],
    views: {
      'main': {
        templateUrl: 'views/manage/scan.html',
        controller: 'scan'
      }
    }
  });
});


admin.controller('admin', function($scope, $http, Auth) {
  $scope.title = 'Admin';
});

admin.directive('focusId', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs, ctrl) {
      element.click(function() {
        $timeout(function () { $('#' + attrs.focusId).focus(); }, 0);
      });
    }
  };
}]);

admin.filter('renderHTML', function($sce) {
	return function(stringToParse) {
		return $sce.trustAsHtml(stringToParse);
	}
});

admin.controller('scan', function($scope, $http, Api) {
  $scope.title = 'Scan';
  $scope.form = { errors: [], loading: {} }

  $scope.scan = function() {
    $scope.form.loading.code = true;
    if(!$scope.form.code) { $scope.form.loading.code = false; return; }

    var code = $scope.form.code.split('.');
    if(code.length == 4) {
      var brew = code[0],
          user = code[1],
          store = code[2],
          timestamp = code[3];

      Api.create('users/brews/tasted', { brew_id: brew, user_id: user, store_id: store}).then(function(data) {
        $scope.form.errors.unshift(data);
        $scope.form.code = null;
        console.log(data);
      }).catch(function(data){
        console.log(data);
        $scope.form.errors.unshift({ error: data.error, message: data.message})
      });
    } else {
      $scope.form.errors.unshift({ error: true, message: 'Code is not valid'})
    }
    $scope.form.loading.code = false;
  }
});

admin.controller('admin.dashboard', function($scope, $state, $localStorage, $http, Auth) {
  $scope.title = 'Dashboard';

  $scope.purge = function() {
    $localStorage.$reset();
  }

  $scope.total = {
    brews: 0,
    users: 0,
    tasted: 0,
  }

});
