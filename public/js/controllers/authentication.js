angular.module('mean.system')
  .controller(
    'AuthenticationController',
    ['$scope', '$http', '$location', '$window',
      ($scope, $http, $location, $window) => {
        $scope.user = {};

        $scope.serverErrorMessage = '';

        $scope.serverErrorExists = () => $scope.serverErrorMessage.length > 0;

        $scope.signup = () => {
          const registeredUser = {
            name: $scope.user.name,
            email: $scope.user.email,
            password: $scope.user.password,
          };
          $http.post('/api/auth/signup', registeredUser)
            .then((res) => {
              const { data: { userDetails } } = res, { token } = userDetails;
              $window.localStorage.setItem('token', token);
              $location.path('/');
              $window.location.reload();
            }, (error) => {
              const { data: { message } } = error;
              $scope.serverErrorMessage = message;
            });
        };
        $scope.login = () => {
          const userInfo = {
            email: $scope.user.email,
            password: $scope.user.password
          };
          $http.post('/api/auth/login', userInfo)
            .then((res) => {
              const { data: { userDetails } } = res,
                { token } = userDetails;
              $window.localStorage.setItem('token', token);
              console.log(`${token} because I am logged in`)
              $location.path('/');
              $window.location.reload();
            }, (error) => {
              const { data: { message } } = error;
              $scope.serverErrorMessage = message;
            });
        };
      }]
  );
