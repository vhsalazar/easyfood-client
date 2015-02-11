var BASE_URL = "http://104.236.80.144:3000";

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

.service('easy_bag', [function EasyBag() {
  var items = [];
  var restaurant = null; // this bag only support one restaurant
  var selected_item = null;

  this.getSelectedItem = function(){
    return selected_item;
  }

  this.selectItem = function (item){
    selected_item = item;
  }

  this.getItems = function(){
    return items;
  }

  this.getRestaurant = function(){
    return restaurant;
  }

  this.isValidItem = function(bag_item){
    if (this.getLength() == 0){
      return true;
    }else{
      return bag_item.restaurant.id == restaurant.id;
    }
  }

  this.addItem = function(bag_item){
    items.push(bag_item);
    restaurant = bag_item.restaurant;
    return items.length;
  }

  this._remove = function(arr, item) {
      for(var i = arr.length; i--;) {
          if(arr[i] === item) {
              arr.splice(i, 1);
          }
      }
  }

  this.removeItem = function(item){
    this._remove(items, item);    
  }

  this.clear = function(){
    restaurant = [];
    items = [];
  }
  
  this.getLength = function(){
    return items.length;
  }
  
  this.getTotal = function(){
    total = 0;
    for (i in items){
      total += items[i].quantity * items[i].menu_item.price;
    }
    return total;
  }

}])

.service('easy_navigation', [function(){
  var restaurants = null;
  var restaurant = null;
  var section = null;
  var item = null;
  var item_edit = null;

  this.clearAll = function(){
    restaurant = null;
    section = null;
    item = null;
  }
}])

.controller('ItemBagCtrl', function($scope, $ionicModal, $timeout, easy_bag) {
  $scope.selected_item = easy_bag.getSelectedItem();
  $scope.item = $scope.selected_item.menu_item;
  $scope.quantity = $scope.selected_item.quantity;
  $scope.special_request = $scope.selected_item.special_request;

  $scope.decrease = function(){
    if ($scope.quantity > 1){
      $scope.quantity -= 1;      
    }    
    $scope.selected_item.quantity = $scope.quantity;
  }

  $scope.increase = function(){
    $scope.quantity++;
    $scope.selected_item.quantity = $scope.quantity;
  }

  $scope.remove = function(){
    easy_bag.removeItem($scope.selected_item);
    $scope.$parent.closeModal();
  }

})
.controller('AppCtrl', function($scope, $ionicModal, $timeout, easy_bag, easy_navigation) {
  // Form data for the login modal
  $scope.loginData = {};
  $scope.my_bag = easy_bag;

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


  $scope.closeModal = function(){
    $scope.modal.hide();
  }

  $scope.showModal = function(){
    $ionicModal.fromTemplateUrl('templates/item_modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  }

  $scope.selectItem = function(item){
    console.log(item);
    easy_bag.selectItem(item);    
    $scope.showModal();
  } 
})

.controller('ExploreCtrl', function($scope, $stateParams, $ionicLoading, $state, $window, $http, easy_client, easy_navigation) {
  $scope.show = function() {
    $ionicLoading.show({
      template: 'Loading...'
    });
  };
  $scope.hide = function(){
    $ionicLoading.hide();
  };
  $scope.supportsGeo = $window.navigator;
  $scope.position = null;
  $scope.restaurants = [];
  $scope.getRestaurants = function() {    
    window.navigator.geolocation.getCurrentPosition(function(position) {
      $scope.$apply(function() {
        $scope.position = position;
        ll = "" + position.coords.latitude + "," + position.coords.longitude;
        console.log(position);
        $scope.show();
        easy_client.explore(ll)
        .success(function(data, status, headers, config) {
          $scope.restaurants = data.restaurants;
          easy_navigation.restaurants = data.restaurants;
        }).
        error(function(data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
        }).finally(function(){
          $scope.hide()
        });
      });
    }, function(error) {
      alert('GPS ERROR :( makes me a sad panda');
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

.controller('MyBagCtrl', function($scope, $stateParams, $state, $window, $http, easy_bag) {
  $scope.my_bag = easy_bag;  
  $scope.items  = easy_bag.items;
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
      restaurant: $scope.restaurant,
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
