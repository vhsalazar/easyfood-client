// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'LocalStorageModule', 'starter.controllers'])
.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('easyfood')
    .setNotify(true, true);
})
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })  

    .state('app.explore', {
      url: "/explore",
      views: {
        'menuContent' :{
          templateUrl: "templates/explore.html",
          controller: 'ExploreCtrl'
        }
      }
    })
    
    .state('app.mybag', {
      url: "/mybag",
      views: {
        'menuContent' :{
          templateUrl: "templates/my_bag.html",
          controller: 'MyBagCtrl'
        }
      }
    })

    .state('app.menu', {
      url: "/restaurants/:restaurant_id",
      views: {
        'menuContent' :{
          templateUrl: "templates/restaurant_menu.html",
          controller: 'RestaurantMenuCtrl'
        }
      }
    })

    .state('app.add_item', {
      url: "/item/:item_id",
      views: {
        'menuContent' :{
          templateUrl: "templates/item_add.html",
          controller: 'MenuItemCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/explore');
});

