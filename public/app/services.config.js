var hop = angular.module('hop.config', ['ngStorage']);

hop.factory('Config', function($q, $localStorage, $rootScope, $http) {

  var config = {};

  return({
    init: init,
    get: get
  });

  function init() {
    if($localStorage.config) {
      config = $localStorage.config;
    }
  }

  // /////////////////
	// //  FILTERS AND META ///
	// /////////////////


  // /////////////////
	// //  API CALLS ///
	// /////////////////

  function get(key) {
    if(key) {
      return config[key];
    } else {
      return config;
    }
  }

  // function setAll(data) {
  //   //Api.cache('config', data);
  // }

  // /////////////////
  // //  Update Config on the Server with data ///
  // /////////////////

  // function update(data) {
  //   var deferred = $q.defer();
  //   //send request to register endpoint
  //   $http.put(get('url')+'/config', data)
  //     .success(function(data, status) {
  //       console.log(data);
  //       if(!data.error) {
  //         deferred.resolve(data);
  //       } else {
  //         deferred.reject(data);
  //       }
  //     })
  //     .error(function(data) {
  //       console.log(data);
  //       deferred.reject(data);
  //     });
  //
  //     //return promise object
  //     return deferred.promise;
  // }

  // function refresh(key) {
  //   var deferred = $q.defer();
  //
  //   $http.get(config.url+'/config', { params: { q: key }})
  //   .success(function(data, status) {
  //     if(!data.error) {
  //       deferred.resolve(data);
  //     } else {
  //       deferred.reject(data);
  //     }
  //   })
  //   .error(function(data) {
  //     deferred.reject(data);
  //   });
  //
  //   //return promise object
  //   return deferred.promise;
  // }
  //
  // function refreshAll() {
  //
  //   return Api.get(config.url+'/config')
  //   .then(function(data) {
  //     Api.cache('config', data);
  //   })
  // }

});
