angular.module('mean.system').controller('IndexController', [
  '$scope',
  '$window',
  '$location',
  'Global',
  'socket',
  'game',
  ($scope, $window, $location, Global, socket, game) => {
    $scope.global = Global;
    $scope.showOptions = true;

    $scope.playAsGuest = () => {
      game.joinGame();
      $location.path('/app');
    };

    $scope.selectRegionToPlayAsGuest = () => {
      $scope.gameMode = 'guest';
      $('#selectRegion').modal();
    };

    $scope.selectRegionToPlayWithFriends = () => {
      $scope.gameMode = 'friends';
      $('#selectRegion').modal();
    };

    $scope.showError = () => {
      if ($location.search().error) {
        return $location.search().error;
      }

      return false;
    };

    $scope.showOptions = () => {
      if (window.localStorage.token || window.user) {
        $scope.showOptions = false;
      } else {
        $scope.showOptions = true;
      }
      return false;
    };

    $scope.selectedRegion = '59b90186ad7d37a9fb7d3630';

    $scope.startGameForRegion = () => {
      localStorage.setItem('selectedRegion', $scope.selectedRegion);
      window.location.href =
        `/play${$scope.gameMode === 'friends' ? '?custom' : ''}`;
    };
    $scope.showOptions();
    $scope.avatars = [];
  }
]);
