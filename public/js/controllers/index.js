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

    $scope.showError = () => {
      if ($location.search().error) {
        return $location.search().error;
      }

      return false;
    };

    $scope.showOptions = () => {
      if (window.localStorage.token) {
        $scope.showOptions = false;
      } else {
        $scope.showOptions = true;
      }
      return false;
    };
    $scope.playGameAsGuest = () => {
      $scope.gameMode = 'guest';
      $('#selectRegion').modal();
    };

    $scope.selectedRegion = '1';

    $scope.startGameForRegion = () => {
      localStorage.setItem('selectedRegion', $scope.selectedRegion);
      window.location.href = `/play${$scope.gameMode === 'friends' ? '?custom' : ''}`;
    };
    $scope.showOptions();

    $scope.signOut = () => {
      window.localStorage.removeItem('token');
      $location.path('/');
      window.location.reload();
    };

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then((data) => {
        $scope.avatars = data;
      });
  }
]);
