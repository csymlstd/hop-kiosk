var hop = angular.module('hop.c', ['ngStorage']);

hop.controller('setupController', function($scope, $state, $localStorage, $http, BrewService, Config, Api) {

  $scope.form = {
    step: 1,
    store: null,
    setup: {
      url: 'http://h.csymlstd.xyz:5000/api'
    },
    errors: {}
  }

  $scope.loading = {  form: { step: false } }

  $scope.selectStore = function(id) {
    $scope.form.store = id;
  }

  $scope.setup = function() {
    if($scope.form.step == 1) {
      if(!$scope.form.setup.url) {
        $scope.form.errors.setup.url = 'A URL is required.';
      } else {
        $scope.loading.form.step = true;
        $localStorage.config = {
          url: $scope.form.setup.url
        }
        Api.get('stores')
          .then(function(data) {
            $scope.storeOptions = data;

            $scope.loading.form.step = false;
            $scope.$apply(function() { $scope.form.step = 2; });
            Config.init();
          })
          .catch(function(err) {
            console.log(err);
            $scope.loading.form.step = false;
            $scope.form.errors.setup.url = 'Could not connect to server.';
          });
      }
    }

    if($scope.form.step == 2) {

      Api.get('brewers');
      Api.get('brews');

      if(!$scope.form.store) {
        $scope.form.errors.store = 'Choose a store.';
      } else {
        $localStorage.config.store = $scope.form.store
        $state.go('home');
      }
    }
  }
});

//create the controller and inject Angular's $scope
hop.controller('mainController', function($scope, $rootScope, $http, Auth, BrewService) {

  $rootScope.$on('serverError', function(event, data) {
    $scope.connection = data;
  });

  $scope.brews = []

});


// Login Controller
hop.controller('loginController', function($scope, $state, Auth) {

  $scope.title = 'Login';
  $scope.form = {
    loading: {},
    error: false
  }

  $scope.loginFacebook = function() {
    $scope.error = false;
    $scope.form.loading.facebook = true;
    $scope.disabled = true;
    Auth.loginFacebook()
      .then(function() {
        $state.go('my');
        $scope.form.loading.facebook = false;
        $scope.disabled = false;
      })
      .catch(function(data) {
        $scope.form.loading.facebook = false;
        $scope.error = true;
        $scope.errorMessage = data;
        $scope.disabled = false;
      })
  }

  $scope.loginGoogle = function() {
    $scope.error = false;
    $scope.form.loading.google = true;
    $scope.disabled = true;
    Auth.loginGoogle()
      .then(function() {
        $state.go('my');
        $scope.form.loading.google = false;
        $scope.disabled = false;
      })
      .catch(function(data) {
        $scope.form.loading.google = false;
        $scope.error = true;
        $scope.errorMessage = data;
        $scope.disabled = false;
      })
  }

  $scope.loginCard = function() {
    var cardNumber = $scope.form.card.number
    $scope.form.card = {
      loading: true,
    }

    Auth.loginCard(cardNumber)
      .then(function() {
        $state.go('my');

        $scope.form.card.loading = false;
        $scope.form.card.number = undefined;
        $scope.form.card.disabled = false;
      })
      .catch(function(data) {
        $scope.form.card.error = true;
        $scope.form.card.errorMessage = data;
        $scope.form.card.loading = false;
        $scope.form.card.number = undefined;
        $scope.form.card.disabled = false;
      })
  }

  $scope.login = function() {
    $scope.error = false;
    $scope.form.loading.login = true;
    $scope.disabled = true;

    Auth.login($scope.form.login.username, $scope.form.login.password)
      .then(function() {
        $state.go('my');

        $scope.form.loading.login = false;
        $scope.form.login = {};
        $scope.disabled = false;
      })
      .catch(function(data) {
        $scope.error = true;
        $scope.errorMessage = data;

        $scope.form.loading.login = false;
        $scope.disabled = false;
      })
  }
});

// Logout Controller
hop.controller('passwordController', function($scope, $state, Auth) {
    $scope.title = 'Forgot Password';
});

// Logout Controller
hop.controller('logoutController', function($scope, $state, Auth) {
    //call logout from service
    Auth.logout();
    swal({
      title: 'See you next time!',
      type: 'success',
      timer: 1000,
      showConfirmButton: false
    });
    $state.go('home');
});

// Register Controller
hop.controller('registerController', function($scope, $state, Auth) {

  if(Auth.isLoggedIn()) {
    $state.go('my');
  }

  $scope.form = {
    error: false,
    toggle: {
      password: {
        string: 'unhide',
        type: 'password'
      }
    }
  }

  $scope.register = function() {
    $scope.disabled = false;
    $scope.form.toggle.password = {
      string: 'unhide',
      type: 'password'
    }

    Auth.register($scope.form)
      .then(function(data) {
        $state.go('my');
        swal({
          title: 'Welcome!',
          type: 'success',
          timer: 1000,
          showConfirmButton: false
        });
        $scope.disabled = false;
      })
      .catch(function(data) {
        $scope.error = true;
        $scope.error.message = data.message;
        $scope.form.disabled = false;
      })
  }

  $scope.togglePassword = function() {
    if($scope.form.toggle.password.type == 'password') {
      $scope.form.toggle.password.type = 'text';
      $scope.form.toggle.password.string = 'hide';
    } else {
      $scope.form.toggle.password.type = 'password';
      $scope.form.toggle.password.string = 'unhide';
    }
  }
});
