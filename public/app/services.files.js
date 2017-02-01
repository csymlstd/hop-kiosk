var hop = angular.module('hop.services.files', ['ngStorage', 'ngFileUpload']);

hop.factory('FileService', function($q, $localStorage, $rootScope, Upload) {
  var fileServer = 'http://h.csymlstd.xyz:5000/api/files';

  return({
    init: init,
    upload: upload,

  });

  function init() {

    // getBrewers().then(function(data) {
    //   $rootScope.brewers = data;
    // }).catch(function(data) { });


  }

  /////////////////
	//  API CALLS ///
	/////////////////

  function upload(file) {
    var deferred = $q.defer();

    Upload.upload({
      url: 'http://h.csymlstd.xyz:5000/api/files/upload',
      data: {file: file}
    }).then(function(response) {
      if(!response.data.error) {
        //Successful Uploading
        console.log(response.config.data.file)
        deferred.resolve(response.config.data.file);
      } else {
        deferred.reject({ error: response.data.error });
      }
    }, function(response){ // catch error
      deferred.reject({ error: response.status });
    }, function(evt) {
      console.log(evt);
      var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      console.log('Progress: '+ progressPercentage + '% ' + evt.config.data.file.name);
      var progress = progressPercentage + '%'; // capture upload progress
    });

    //return promise object
    return deferred.promise;
  }


});
