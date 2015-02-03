var BASE_URL = "http://192.168.5.145:3000";

angular.module('starter.api', [])
  .service('easy_client', ['$window', '$http', function (win, $http) {
      var token = null;
      var access_token = '';
      // if (hello.getAuthResponse('dashboard')) {
      //     access_token = hello.getAuthResponse('dashboard').access_token;
      // }
      this.setToken = function (token) {
          access_token = token;
      };

      this.registerToken = function (token) {
        return $http.post(BASE_URL + "/users/register_token.json?access_token=" + access_token,
            {token: window.token});
      };
      
      this.getRestaurantMenu = function (restaurant_id) {
        return $http.get(BASE_URL + '/api/restaurants/' + restaurant_id + '/menu.json', {params: {access_token: access_token}});
      };

      this.getMenuItem = function (menu_item_id) {
        return $http.get(BASE_URL + '/api/items/' + menu_item_id + '.json', {params: {access_token: access_token}});
      };

      this.explore = function(ll){
        return $http.get(BASE_URL +'/api/restaurants/explore.json', {params: {ll: ll, access_token: access_token}});
      }
  }])
angular.module('starter.controllers', ['starter.api'])

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
.controller('ExploreCtrl', function($scope, $stateParams, $window, $http, easy_client) {
  $scope.supportsGeo = $window.navigator;
  $scope.position = null;
  $scope.restaurants = [];
  $scope.doTest1 = function() {
    window.navigator.geolocation.getCurrentPosition(function(position) {
        $scope.$apply(function() {
            $scope.position = position;
            ll = "" + position.coords.latitude + "," + position.coords.longitude;
            console.log(position);
            easy_client.explore(ll)
            .success(function(data, status, headers, config) {
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

})

.controller('RestaurantMenuCtrl', function($scope, $stateParams, $http, easy_client) {
  $scope.menu = [];
  console.log($stateParams);
  $scope.getMenu = function(){
    easy_client.getRestaurantMenu($stateParams.restaurant_id)
    .success(function(data, status, headers, config) {
        $scope.menu = data.menu_sections;
    }).error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    }); 
  };
  $scope.getMenu();
})


.controller('MenuItemCtrl', function($scope, $stateParams, $http, $window, easy_client) {
  $scope.item = [];
  $scope.quantity = 1;
  $scope.total_price = function(){
    return $scope.quantity * $scope.item.price;
  };
  console.log($stateParams);
  $scope.setup = function(){
    easy_client.getMenuItem($stateParams.item_id)
    .success(function(data, status, headers, config) {
        $scope.item = data;
    }).error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    }); 
  };
  $scope.decrease = function(){
    if ($scope.quantity > 1){
      $scope.quantity -= 1;
    }    
  }

  $scope.increase = function(){
    $scope.quantity++;
  }

  $scope.addToBag = function(){
    $window.history.back();
  }

  $scope.setup();
})




;
