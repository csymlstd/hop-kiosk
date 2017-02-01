var admin = angular.module('hop.c.admin.config', ['ui.router', 'ngStorage']);


admin.config(function($stateProvider, $httpProvider, $urlRouterProvider) {
  $stateProvider
  .state('admin.config', {
    url: '/config',
    authenticate: true,
    permissions: ['access-administration'],
    views: {
      'admin': {
        templateUrl: 'views/admin/config/application.html',
        controller: 'admin.config'
      }
    }
  })
  .state('admin.config.club', {
    url: '/club',
    authenticate: true,
    permissions: ['access-administration'],
    views: {
      'admin@admin': {
        templateUrl: 'views/admin/config/club.html',
        controller: 'admin.config.club'
      }
    }
  })
  .state('admin.config.kiosks', {
    url: '/kiosks',
    authenticate: true,
    permissions: ['access-administration'],
    views: {
      'admin@admin': {
        templateUrl: 'views/admin/config/kiosks.html',
        controller: 'admin.config.kiosks'
      }
    }
  })
  .state('admin.config.api', {
    url: '/api',
    authenticate: true,
    permissions: ['access-administration'],
    views: {
      'admin@admin': {
        templateUrl: 'views/admin/config/api.html',
        controller: 'admin.config.api'
      }
    }
  })
  .state('admin.config.integrations', {
    url: '/integrations',
    authenticate: true,
    permissions: ['access-administration'],
    views: {
      'admin@admin': {
        templateUrl: 'views/admin/config/integrations.html',
        controller: 'admin.config.integrations'
      }
    }
  });
});

admin.controller('admin.config', function($scope, $http, Config) {
  $scope.form = {
    data: {
      api: Config.get('api'),
      app: Config.get('app'),
      storage: Config.get('storage')
    }
  };

  $scope.save = function() {
    Config.update($scope.form.data).then(function() {
      swal({
        title: 'Application Configuration Saved',
        type: 'success',
        timer: 1000,
        showConfirmButton: false
      });
    });
  }
});

admin.controller('admin.config.club', function($scope, $http, Config) {
  $scope.title = 'Club Configuration';

  $scope.form = {
    data: {
      club: Config.get('club')
    }
  };

  $scope.save = function() {
    Config.update($scope.form.data).then(function() {
      swal({
        title: 'Club Configuration Saved',
        type: 'success',
        timer: 1000,
        showConfirmButton: false
      });
    });
  }

});

admin.controller('admin.config.api', function($scope, $http, Config) {
  $scope.title = 'API Configuration';
});

admin.controller('admin.config.integrations', function($scope, $http, Config) {
  $scope.title = 'Third-Party Integrations';
});

admin.controller('admin.config.kiosks', function($scope, $http, Config) {
  $scope.title = 'Kiosk Configuration';

  $scope.form = {
    kiosks: {
      cache: {
        private: false,
      }
    }
  }

});
