angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})
.controller('HomeCtrl', function($scope, $stateParams, $window, $http) {
  $scope.supportsGeo = $window.navigator;
  $scope.position = null;
  $scope.restaurants = [];
  $scope.doTest1 = function() {
    window.navigator.geolocation.getCurrentPosition(function(position) {
        $scope.$apply(function() {
            $scope.position = position;
            ll = "" + position.coords.latitude + "," + position.coords.longitude;
            console.log(position);
            $http.get('http://192.168.5.145:3000/api/restaurants/explore.json', {params: {ll: ll}}).success(function(data, status, headers, config) {
              $scope.restaurants = data.restaurants;
            }).
            error(function(data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            });
            $scope.restaurants = [ "AAAA", "BBBBB", "CcCCC"];
        });
    }, function(error) {
        alert(error);
    });
  };
  $scope.doTest1();

})
.controller('PlaylistCtrl', function($scope, $stateParams, $http) {
  $scope.menu = [];
  $scope.getMenu = function(){
      $http.get('http://192.168.5.145:3000/api/restaurants/116/menu.json').success(function(data, status, headers, config) {
          $scope.menu = data.menu_sections;

      }).error(function(data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
      }); 
  };
  $scope.getMenu();
});
