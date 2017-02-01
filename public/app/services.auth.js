var hop = angular.module('hop.services.auth', ['ngStorage', 'angular-jwt']);

hop.factory('Auth', function($q, $window, $localStorage, $sessionStorage, jwtHelper, $rootScope, $http, BrewService, Config) {
  //create user var
  var user = false;
  $rootScope.user = false;

  var roles = false;
  $rootScope.roles = false;

  //return available functions for use in the controllers
  return({
    init: init,
    isLoggedIn: isLoggedIn,
    isTokenExpired: isTokenExpired,
    getUser: getUser,
    refreshToken: refreshToken,
    refreshUser: refreshUser,
    checkPermissionForView: checkPermissionForView,
    userHasPermission: userHasPermission,
    login: login,
    loginCard: loginCard,
    loginFacebook: loginFacebook,
    loginGoogle: loginGoogle,
    logout: logout,
    update: update,
    register: register
  });

  /////////////////
  //  Init ///
  /////////////////

  function init() {
    if(isLoggedIn()) {
      user = $localStorage.user;
      $rootScope.user = $localStorage.user;
    }

  }

  /////////////////
  //  Check if User is logged in ///
  /////////////////

  function isLoggedIn() {
    if($localStorage.user && $localStorage.token) {
      return true;
    }

    return false;
  }

  /////////////////
  //  Check if User's token is expired ///
  /////////////////

  function isTokenExpired() {
    if($localStorage.user && $localStorage.token) {
      if(jwtHelper.isTokenExpired($localStorage.token)) {
        return true;
      }
    }

    return false;
  }

  /////////////////
  //  Cache a Token to localStorage ///
  /////////////////

  function setToken(token) {
    if(!token) {
      delete $localStorage.token;
    } else {
      if(!jwtHelper.isTokenExpired(token) && $localStorage.token !== token){
        $localStorage.token = token;
      }
    }
  }

  /////////////////
  //  Cache a User to localStorage and Root Scope ///
  /////////////////

  function cacheUser(u) {
    user = u;
    $localStorage.user = u;
    $rootScope.user = u;
  }

  /////////////////
  //  Get currently logged in User data ///
  //  @todo if cache is expired, refreshUser()
  /////////////////

  function getUser() {
    if(isLoggedIn()) {
      user = $localStorage.user;
      return user;
    } else {
      return false;
    }
  }

  /////////////////
  //  Check if View requires permission ///
  /////////////////

  function checkPermissionForView(view) {
    if(!view.authenticate) {
      return true;
    }

    return userHasPermissionForView(view);
  }

  /////////////////
  //  Check if User has permission for View ///
  /////////////////

  function userHasPermissionForView(view) {
    if(!isLoggedIn()) {
      return false;
    }

    if(!view.permissions || !view.permissions.length) {
      return true;
    }

    return userHasPermission(view.permissions);
  }

  /////////////////
  //  Check if User can use Permission ///
  //  @todo Set a default user to Anonymous to allow specific permissions
  /////////////////

  function userHasPermission(permissions) {
    if(!isLoggedIn()) {
      return false;
    }
    var permitted = false;

    var scope = getScope();

    var permitted = permissions.every(function(value) {
      return (scope.permissions.indexOf(value) >= 0);
    });

    // angular.forEach(permissions, function(permission, index) {
    //   if(scope.permissions.indexOf(permission) >= 0) {
    //     console.log(permission);
    //     permitted = true;
    //   } else {
    //     permitted = false;
    //   }
    // });

    return permitted;
  }

  /////////////////
  //  Get Scope From Token ///
  /////////////////

  function getScope() {
    var token = getToken();
    var payload = jwtHelper.decodeToken(token);
    var scope = payload.scope;
    return scope;
  }

  /////////////////
  //  Get Token ///
  /////////////////

  function getToken() {
    return $localStorage.token;
  }

  /////////////////
  //  Cache Roles to localStorage ///
  /////////////////

  function cacheRoles(data) {
    roles = [];
    for(i=0; i<data.length; i++) {
      var r = data[i];
      roles[r._id] = { permissions: r.permissions }
    }
    $sessionStorage.roles = roles;
  }

  /////////////////
  //  Get Roles from Server ///
  /////////////////

  function getRoles() {
    //create a new instance of deferred
    var deferred = $q.defer();

    //send a post request to the server
    $http.get(Config.get('url')+'/auth/roles')
    .success(function(data, status) {
      if(!data.error) {
        cacheRoles(data);
        deferred.resolve(roles);
      } else {
        roles = false;
        deferred.reject(data.error);
      }
    })
    .error(function(data) {
      roles = false;
      deferred.reject(roles);
    });

    //return promise object
    return deferred.promise;
  }

  /////////////////
  //  Refresh the Token sent in the Authorization header ///
  /////////////////

  function refreshToken() {

    //create a new instance of deferred
    var deferred = $q.defer();

    $http.get(Config.get('url')+'/auth/refresh')
    .success(function (data) {
      if(!data.error){
        setToken(data.token);
        //console.log('Refresh OK');
        deferred.resolve(true);
      } else {
        //console.log('Refresh Fail');
        deferred.resolve(false);
      }
    })
    .error(function (data) {
      //logout();
      deferred.reject(false);
    });

    return deferred.promise;
  }

  /////////////////
  //  Refresh User data from the Server ///
  //  Use getUser() to retrieve cached User data.
  /////////////////

  function refreshUser() {

    //create a new instance of deferred
    var deferred = $q.defer();

    $http.get(Config.get('url')+'/user')
    .success(function (data) {
      if(!data.error){
        cacheUser(data);
        deferred.resolve();
      } else {
        console.log('Failed Refreshing User');
        //logout();
        deferred.reject(data);
      }
    })
    .error(function (data) {
      console.log('Error Refreshing User');
      console.log(data);
      //logout();
      deferred.reject(data);
    });

    return deferred.promise;
  }

  /////////////////
  //  Update a User on the Server with data ///
  /////////////////

  function update(data) {
    var deferred = $q.defer();
    //send request to register endpoint
    $http.put(Config.get('url')+'/user', data)
      .success(function(data, status) {
        console.log(data);
        if(!data.error) {
          cacheUser(data.user);
          deferred.resolve(data);
        } else {
          deferred.reject(data);
        }
      })
      .error(function(data) {
        console.log(data);
        deferred.reject(data);
      });

      //return promise object
      return deferred.promise;
  }

  /////////////////
  //  Login a User with a username and password ///
  /////////////////

  function login(username, password) {
    //create a new instance of deferred
    var deferred = $q.defer();

    //send a post request to the server
    $http.post(Config.get('url')+'/auth', {username: username, password: password})
    .success(function(data, status) {
      if(!data.error) {
        cacheUser(data.user);
        setToken(data.token);
        deferred.resolve();
      } else {
        user = false;
        deferred.reject(data.error);
      }
    })
    .error(function(data) {
      user = false;
      deferred.reject(data);
    });

    //return promise object
    return deferred.promise;
  }

  /////////////////
  //  Login with a Card Number ///
  //  @todo require password unless an api key authorizes it
  /////////////////

  function loginCard(number) {
    console.log('Service Login Card with: '+number)
    //create a new instance of deferred
    var deferred = $q.defer();

    //send a post request to the server
    $http.post(Config.get('url')+'/auth/card', { number: number })
    .success(function(data, status) {
      if(!data.error) {
        cacheUser(data.user);
        setToken(data.token);
        deferred.resolve();
      } else {
        user = false;
        deferred.reject(data.error);
      }
    })
    .error(function(data) {
      user = false;
      deferred.reject(data);
    });

    //return promise object
    return deferred.promise;
  }

  /////////////////
  //  Login with an OAuth Service ///
  /////////////////

  function oauthLogin(service, token, id) {
    //create a new instance of deferred
    var deferred = $q.defer();
    //send a post request to the server
    $http.post(Config.get('url')+'/auth/'+service, {token: token, id: id})
    .success(function(data, status) {
      if(!data.error) {
        cacheUser(data.user);
        setToken(data.token);
        deferred.resolve(data);
      } else {
        user = false;
        deferred.resolve(data);
      }
    })
    .error(function(data) {
      user = false;
      deferred.reject(data);
    });

    //return promise object
    return deferred.promise;
  }

  /////////////////
  //  Link an OAuth Service to current User ///
  //  Will cache updated User profile and provide new Token
  /////////////////

  function oauthLink(service, token, id) {
    //create a new instance of deferred
    var deferred = $q.defer();
    console.log('Linking '+service);
    //send a post request to the server
    $http.post(Config.get('url')+'/auth/'+service, {token: token, id: id})
    .success(function(data, status) {
      if(!data.error) {
        cacheUser(data.user);
        setToken(data.token);
        deferred.resolve(data);
      } else {
        deferred.reject(data);
      }
    })
    .error(function(data) {
      deferred.reject(data);
    });

    //return promise object
    return deferred.promise;
  }

  /////////////////
  //  Login User to Facebook ///
  //  If the User is already logged in, link the Facebook account.
  //  If the User is already linked with Facebook or another User
  //      is linked with this Facebook, an error will be returned.
  /////////////////

  function loginFacebook() {
    //create a new instance of deferred
    var deferred = $q.defer();

    FB.login(function(response){
      if(response.authResponse) {
        var id = response.authResponse.userID,
            token = response.authResponse.accessToken;
        if(isLoggedIn()) {
          oauthLink('facebook', token, id).then(function(data) {
              deferred.resolve(data);
          }).catch(function(data) {
            deferred.reject(data);
          });
        } else {
          oauthLogin('facebook', token, id).then(function(data) {
              if(!data.error) {
                deferred.resolve(data);
              } else {
                deferred.reject(data);
              }
          });
        }
      } else {
        data = { error: 'Cancelled by user' }
        deferred.reject(data);
      }
    }, {scope: 'public_profile,email'});

    return deferred.promise;

  }

  /////////////////
  //  Login User to Google ///
  //  If the User is already logged in, link the Google account.
  //  If the User is already linked with Google or another User
  //      is linked with this Google, an error will be returned.
  /////////////////

  function loginGoogle() {
    //create a new instance of deferred
    var deferred = $q.defer();

    var auth2 = gapi.auth2.getAuthInstance();

    auth2.signIn().then(function(response){
      var token = response.Zi.access_token,
          id = response.getBasicProfile().getId();
        if(isLoggedIn()) {
          oauthLink('google', token, id).then(function(data) {
              deferred.resolve(data);
          }).catch(function(data) {
            deferred.reject(data);
          });
        } else {
          oauthLogin('google', token, id).then(function(data) {
            if(!data.error) {
              deferred.resolve(data);
            } else {
              deferred.reject(data);
            }
          });
        }

    });

    return deferred.promise;
  }

  /////////////////
  //  Register a User with a username and password ///
  /////////////////

  function register(data) {
    var deferred = $q.defer();
    console.log('Sending registration data');
    //send request to register endpoint
    $http.post(Config.get('url')+'/auth/register', data)
      .success(function(data, status) {
        if(!data.error) {
          cacheUser(data.user);
          setToken(data.token);
          deferred.resolve(data);
        } else {
          user = false;
          deferred.reject(data);
        }
      })
      .error(function(data) {
        user = false;
        deferred.reject(data);
      });

      //return promise object
      return deferred.promise;
  }

  /////////////////
  //  Logout the current User ///
  //  Delete logged out User's cached data
  /////////////////

  function logout() {
    user = false;
    delete $rootScope.user;
    delete $localStorage.user;
    delete $localStorage.token;
    delete $localStorage.userBrews;
    return false;
  }


});

hop.factory('ConnectionInterceptor', function($q, $rootScope, $localStorage) {
  return {
    response: function(response) {
      $rootScope.$broadcast('serverError', false);
      return response;
    },
    responseError: function(response) {
      $rootScope.$broadcast('serverError', response.status);
        //return;

      return $q.reject(response);
    }
  }
});

hop.factory('TokenInterceptor', function($q, jwtHelper, $localStorage) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      if ($localStorage.token) {
        //config.headers['x-access-token'] = $localStorage.token;
        config.headers['Authorization'] = 'Bearer '+$localStorage.token;
      }
      return config || $q.when(config);
    },

    response: function(response) {

      return response || $q.when(response);
    }
  };
});

// STANDARD LOGIN AUTHENTICATION
//
// function login(username, password) {
//   //create a new instance of deferred
//   var deferred = $q.defer();
//
//   //send a post request to the server
//   $http.post('/login', {username: username, password: password})
//   .success(function(data, status) {
//     if(!data.error) {
//       user = data;
//       $rootScope.user = user;
//       deferred.resolve();
//     } else {
//       user = false;
//       deferred.reject();
//     }
//   })
//   .error(function(data) {
//     user = false;
//     deferred.reject();
//   });
//
//   //return promise object
//   return deferred.promise;
// }
