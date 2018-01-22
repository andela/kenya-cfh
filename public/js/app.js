angular.module('mean', ['ngCookies',
  'firebase', 'ngResource', 'ui.bootstrap',
  'ui.route', 'mean.system', 'mean.directives'])
  .config(['$routeProvider',
    ($routeProvider) => {
      $routeProvider.when('/', {
        templateUrl: 'views/index.html'
      }).when('/app', {
        templateUrl: '/views/app.html',
      }).when('/privacy', {
        templateUrl: '/views/privacy.html',
      }).when('/bottom', {
        templateUrl: '/views/bottom.html'
      })
        .when('/signin', {
          templateUrl: '/views/signin.html',
          controller: 'AuthenticationController'
        })
        .when('/signup', {
          templateUrl: '/views/signup.html'
        })
        .when('/choose-avatar', {
          templateUrl: '/views/choose-avatar.html'
        })
        .otherwise({
          redirectTo: '/'
        });
    }
  ]).config(['$locationProvider',
    ($locationProvider) => {
      $locationProvider.hashPrefix('!');
    }
  ]).run(['$rootScope', ($rootScope) => {
    $rootScope.safeApply = (functionVariable) => {
      const phase = $rootScope.$root.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        if (functionVariable && (typeof (functionVariable) === 'function')) {
          functionVariable();
        }
      } else {
        $rootScope.$apply(functionVariable);
      }
    };
  }])
  .run(['DonationService', (DonationService) => {
    window.userDonationCb = (donationObject) => {
      DonationService.userDonated(donationObject);
    };
  }]);

angular.module('mean.system', []);
angular.module('mean.directives', []);
