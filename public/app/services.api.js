var hop = angular.module('hop.services.api', []);

hop.factory('Api', function($q, $localStorage, $rootScope, $http, Config) {

  var config = {};

  return({
    init: init,
    cache: cache,
    get: get,
    pull: pull,
    getConfig: getConfig,
    update: update,
    create: create,
  });

  function init() {
    get('config').then(function(data) {
      for(i=0;i<data.length;i++) {
        config[data[i].name] = data[i].value;
      }
      $rootScope.config = config;
    })
  }

  /////////////////
	//  Cache Calls ///
	/////////////////

  function getConfig(key) {
      if(key) {
        return config[key];
      } else {
        return config;
      }
  }

  function get(model, params, updating = false) {
    var db = localforage.createInstance({ name: model });
    var docs = [];
    console.log('Getting '+ model);
    // Checking if it is empty to just get all data from the server
    return db.length().then(function(n) {
      if(n == 0 || updating == true) {
        return pull(model)
      }
    })
    .then(function(data) {
      if(updating == true) {
        return cache(model, data)
      }
    })
    .then(function() {
        return db.iterate(function(value, key, iterationNumber) {
          var valid = true;
          if(params) {
            for(var p in params) {
              if(value.hasOwnProperty(p)) {
                if(value[p] != params[p]) {
                  valid = false;
                  break;
                }
              }
            }
          }
          if(valid) docs.push(value);
          return;
        })
    })
    .then(function() {
      return docs;
    })
    .catch(function(err) {
      console.log(err);
    });
  }


  function cache(model, data, id) {
    var db = localforage.createInstance({ name: model });
    console.log('Caching '+model);
    console.log(data);
    return Promise.all(data.map(function(row) {
      var key = id || row._id || row.id;
      return db.setItem(key, row);
    }));
  }

  /////////////////
	//  API CALLS ///
	/////////////////

  function pull(route, params, save = false) {
    var deferred = $q.defer();
      console.log('Pulling: '+ route)
      $http.get(Config.get('url')+'/'+route, { params: params })
      .success(function(data, status) {
        if(!data.error) {
          deferred.resolve(data);
          if(save == true) {
            cache(route, data);
          }
        } else {
          deferred.reject(data);
        }
      })
      .error(function(data) {
        deferred.reject(data);
      });

    return deferred.promise;
  }

  function update(route, data) {
    var deferred = $q.defer();
      $http.put(Config.get('url')+'/'+route, data)
      .success(function(data, status) {
        if(!data.error) {
          //cache(route, data)
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

  function create(model, data) {
    var deferred = $q.defer();
    $http.post(Config.get('url')+'/'+ model, data)
      .success(function(data, status) {
        if(!data.error) {
          var doc = data.data;
          //cache(model, [doc], doc._id);
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
