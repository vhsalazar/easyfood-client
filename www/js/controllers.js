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
}]);

angular.module('starter.controllers', ['starter.api'])
.service('easy_bag', [function () {
  var bag = [];
  var restaurant_id = null; // this bag only support one restaurant

  this.isValidItem = function(bag_item){
    if (this.getLength() == 0){
      return true;
    }else{
      return bag_item.restaurant_id == restaurant_id;
    }
  }

  this.addItem = function(bag_item){
    bag.push(bag_item);
    restaurant_id = bag_item.restaurant_id;
    return bag.length;
  }

  this.clear = function(){
    bag = [];
  }
  
  this.getLength = function(){
    return bag.length;
  }

}]).

service('easy_navigation', [function(){
  var restaurants = null;
  var restaurant = null;
  var section = null;
  var item = null;
  this.clearAll = function(){
    restaurant = null;
    section = null;
    item = null;
  }
}])


.controller('AppCtrl', function($scope, $ionicModal, $timeout, easy_bag) {
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

  $scope.bag_length = easy_bag.getLength;

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

.controller('ExploreCtrl', function($scope, $stateParams, $state, $window, $http, easy_client, easy_navigation) {
  $scope.supportsGeo = $window.navigator;
  $scope.position = null;
  $scope.restaurants = [];
  $scope.getRestaurants = function() {
    window.navigator.geolocation.getCurrentPosition(function(position) {
      $scope.$apply(function() {
        $scope.position = position;
        ll = "" + position.coords.latitude + "," + position.coords.longitude;
        console.log(position);
        easy_client.explore(ll)
        .success(function(data, status, headers, config) {
          $scope.restaurants = data.restaurants;
          easy_navigation.restaurants = data.restaurants;
        }).
        error(function(data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
        });
      });
    }, function(error) {
      $scope.$apply(function() {
        ll = "-17.820529636235577,-63.23293028751897";
        easy_client.explore(ll)
        .success(function(data, status, headers, config) {
          $scope.restaurants = data.restaurants;
        }).
        error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          });
      });
    });
  };
  $scope.selectRestaurant = function(restaurant){
    easy_navigation.restaurant = restaurant;
    $state.go('app.menu', {restaurant_id: restaurant.id});    
  };

  if (easy_navigation.restaurants == null){
    $scope.getRestaurants();  
  }else{
    $scope.restaurants = easy_navigation.restaurants;
  }
  
})

.controller('RestaurantMenuCtrl', function($scope, $stateParams, $http, easy_client, easy_navigation) {
  $scope.menu = [];
  $scope.restaurant = easy_navigation.restaurant;
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


.controller('MenuItemCtrl', function($scope, $ionicPopup, $stateParams,  $http, $window, easy_client, easy_bag, easy_navigation) {
  $scope.restaurant = easy_navigation.restaurant;
  $scope.item = [];
  $scope.quantity = 1;
  $scope.restaurant_id = $stateParams.r;
  $scope.special_request = "";

  $scope.total_price = function(){
    return $scope.quantity * $scope.item.price;
  };

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
    bag_item = {
      restaurant_id: $scope.restaurant.id,
      menu_item: $scope.item,
      quantity: $scope.quantity,
      special_request: $scope.special_request
    }

    if (easy_bag.isValidItem(bag_item)){
      easy_bag.addItem(bag_item);
      $window.history.back();
    }else{
      var confirmPopup = $ionicPopup.confirm({
        title: 'Warning:',
        template: 'This change will clear the contents of your Bag',
        cancelText: 'Cancel',
        okText: 'Clear Bag'       
      });
      
      confirmPopup.then(function(res) {
       if(res) {
         easy_bag.clear();
         easy_bag.addItem(bag_item);
         $window.history.back();
        } else {
         console.log('You are not sure');
        }
      });
    }
  }

  $scope.setup();
});
