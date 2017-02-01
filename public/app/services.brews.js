var hop = angular.module('hop.services.brews', ['ngStorage', 'angularMoment']);

hop.filter('hasBrew', function() {
  return function(brews, brew) {
    return brews.filter(function(b) {
      return b.brew == brew;
    })
  }
});

hop.factory('BrewService', function($q, $localStorage, $rootScope, $http, Config, Api) {

  var brews = [],
      brewers = [],
      storeBrews = [],
      tastedBrews = [],
      userBrews = [],
      store = false;

  return({
    init: init,
    get: get,
    scan: scan,
    tastedThisRound: tastedThisRound,
  });

  function init() {

  }

  /////////////////
	//  FILTERS AND META ///
	/////////////////

  function tastedThisRound(round) {
    var deferred = $q.defer();

    Api.get('users/brews/tasted', { user: $rootScope.user._id, round: round })
    .then(function(data) {
      deferred.resolve(data);
    })
    .catch(function(err) {
      deferred.reject(err);
    });

    return deferred.promise;
  }

  function getBrewer(brewer_id) {
    if($localStorage.brewers) {
      var brewers = $localStorage.brewers.data;
      return brewers.filter(function(b) {
        return b._id == brewer_id;
      })
    }
  }

  function getBrew(brew_id) {
    if($localStorage.brews) {
      var brews = $localStorage.brews.data;
      return brews.filter(function(b) {
        return b._id == brew_id;
      })
    }
  }

  function getUserBrew(userbrew_id) {
    if($localStorage.userBrews) {
      var userBrews = $localStorage.userBrews.data;
      return userBrews.filter(function(b) {
        return b._id == userbrew_id;
      })
    }
  }

  function getStoreBrew(storebrew_id) {
    if($localStorage.storeBrews) {
      var storeBrews = $localStorage.storeBrews.data;
      return storeBrews.filter(function(b) {
        return b._id == storebrew_id;
      })
    }
  }

  function storeHasBrew(brew_id, store_id) {
    if($localStorage.storeBrews) {
      var storeBrews = $localStorage.storeBrews.data;
      return storeBrews.filter(function(b) {
        return b.brew == brew_id && b.store == store;
      });
    }
  }

  function getTastedBrew(brew_id, round) {
    if($localStorage.tastedBrews) {
      var tastedBrews = $localStorage.tastedBrews.data;
      return tastedBrews.filter(function(tb) {
          return tb.brew == brew_id &&
                 tb.user == $rootScope.user._id &&
                 tb.store == Config.get('store');
      });
    }
  }

  /////////////////
	//  API CALLS ///
	/////////////////

  function get(model) {
    var deferred = $q.defer();


    switch(model) {
      case 'brewers':
        if(brewers.length == 0) {
          getBrewers().then(function(data) {
            deferred.resolve(data);
          });
        } else {
          deferred.resolve(brews);
        }
        break;
      case 'brews':
        if(brews.length == 0) {
          getBrews().then(function(data) {
            deferred.resolve(data);
          });
        } else {
          deferred.resolve(brews);
        }
        break;
      case 'userbrews':
        if(userBrews.length == 0) {
          getUserBrews().then(function(data) {
            deferred.resolve(data);
          });
        } else {
          deferred.resolve(userBrews);
        }
        break;
      case 'storebrews':
        if(storeBrews.length == 0) {
          getStoreBrews().then(function(data) {
            deferred.resolve(data);
          });
        } else {
          deferred.resolve(storeBrews);
        }
        break;
      case 'tastedbrews':
      if(tastedBrews.length == 0) {
        getTastedBrews().then(function(data) {
          deferred.resolve(data);
        });
      } else {
        deferred.resolve(tastedBrews);
      }
        break;
    }

    return deferred.promise;
  }

  function scan(brew, user, store, timestamp) {
    var deferred = $q.defer();
    data = {
      brew_id: brew,
      user_id: user,
      store_id: store
    }
    $http.post(Config.get('url')+'/users/brews/tasted', data)
    .success(function(data, status) {
      if(!data.error) {
        deferred.resolve(data);
      } else {
        deferred.reject(data);
      }
    })
    .error(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  }

  function getBrewers() {
    var deferred = $q.defer();
    if($localStorage.brewers) {
      deferred.resolve($localStorage.brewers.data);
    } else {
      $http.get(Config.get('url')+'/brewers')
      .success(function(data, status) {
        if(!data.error) {
          Api.cache('brewers', data).then(function() {
            brewers = data;
            deferred.resolve(data);
          })
        } else {
          deferred.reject(data);
        }
      })
      .error(function(data) {
        deferred.reject(data);
      });
    }

    //return promise object
    return deferred.promise;
  }

  function getTastedBrews() {
    var deferred = $q.defer();
    if($localStorage.tastedBrews) {
      deferred.resolve($localStorage.tastedBrews.data);
    } else {
      $http.get(Config.get('url')+'/users/brews/tasted')
      .success(function(data, status) {
        if(!data.error) {
          $localStorage.tastedBrews = { data: data, updated: new Date() }
          tastedbrews = data;
          deferred.resolve(data);
        } else {
          deferred.reject(data);
        }
      })
      .error(function(data) {
        deferred.reject(data);
      });

    }

    //return promise object
    return deferred.promise;
  }

  function getBrews() {
    var deferred = $q.defer();
    if($localStorage.brews) {
      deferred.resolve($localStorage.brews.data);
    } else {
      $http.get(Config.get('url')+'/brews')
      .success(function(data, status) {
        if(!data.error) {
          for(i = 0; i < data.length; i++) {
              var brewer_id = data[i].brewer;
              data[i].brewer = getBrewer(brewer_id);
          }
          $localStorage.brews = { data: data, updated: new Date() }
          brews = data;
          deferred.resolve(data);
        } else {
          deferred.reject(data);
        }
      })
      .error(function(data) {
        deferred.reject(data);
      });
    }
    //return promise object
    return deferred.promise;
  }

  function getStoreBrews(store_id) {
    var deferred = $q.defer();
    if(!store_id) { store_id = Config.get('store') }
    if($localStorage.storeBrews) {
      deferred.resolve($localStorage.storeBrews.data);
    } else {
      $http.get(Config.get('url')+'/stores/' + store_id + '/brews')
      .success(function(data, status) {
        if(!data.error) {
          for(i = 0; i < data.length; i++) {
              var brew_id = data[i].brew;
              data[i].brew = getBrew(brew_id);
              //console.log(data[i]);
          }
          storeBrews = data;
          $localStorage.storeBrews = { data: data, updated: new Date() }
          deferred.resolve(data);
        } else {
          deferred.reject(data);
        }
      })
      .error(function(data) {
        deferred.reject(data);
      });
    }

    //return promise object
    return deferred.promise;
  }

  function getUserBrews() {
    var deferred = $q.defer();
    if($localStorage.userBrews) {
      deferred.resolve($localStorage.userBrews.data);
    } else {
    $http.get(Config.get('url')+'/users/'+ $rootScope.user._id +'/brews')
      .success(function(data, status) {
        if(!data.error) {


          userBrews = data;
          $localStorage.userBrews = { data: data, updated: new Date() }
          deferred.resolve(data);
        } else {
          deferred.reject(data);
        }
      })
      .error(function(data) {
        deferred.reject(data);
      });
    }

    return deferred.promise;
  }

  function create(model, data) {
    var deferred = $q.defer();
    var url = Config.get('url')+'/'+ model;
    console.log(url);
    $http.post(url, data)
      .success(function(data, status) {
        if(!data.error) {
          $localStorage[model] = { data: data, updated: new Date() }
          deferred.resolve(data);
        } else {
          deferred.reject(data);
        }
      })
      .error(function(data) {
        deferred.reject(data);
      });

    return deferred.promise;
  }

});
