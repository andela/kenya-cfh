angular.module('mean.system') /* eslint-enable */
  .controller('DashboardController', ['$scope', '$http', ($scope, $http) => {
    $scope.donationData = {};
    $scope.gamesData = {};
    $scope.leaderBoardData = {};
    $scope.leaderBoard = true;
    $scope.gameLog = false;
    $scope.donations = false;
    $scope.noGameLog = false;
    $scope.noDonations = false;
    $scope.noLeaderBoard = false;
    $scope.gameLogRange = [];
    $scope.donationsCount = 0;
    $scope.leaderBoardCount = 0;
    $scope.notAuthorized = false;
    angular.element('#leaderboard').addClass('active-class');


    $scope.getDonations = () => {
      const token = localStorage.getItem('token');
      $http.get('/api/v1/donations/', {
        headers: { 'x-token': token }
      }).then((user) => {
        $scope.donationData = user.data;
        const range = [];
        if ((user.data.donations).length !== 0) {
          (user.data).forEach((element, index) => {
            index += 1;
            range.push(index);
          });
        }
        $scope.donationsCount = range;
      }, () => { $scope.notAuthorized = true; });
    };

    $scope.getGameLogs = () => {
      const token = localStorage.getItem('token');
      $http.get('/api/v1/games/history', {
        headers: { 'x-token': token }
      }).then((user) => {
        $scope.gamesData = user.data;
        const range = [];
        (user.data).forEach((element, index) => {
          index += 1;
          range.push(index);
        });
        $scope.gameLogCount = range;
      });
    };

    $scope.getLeaderBoard = () => {
      $http.get('api/v1/games/leaderboard')
        .then((user) => {
          $scope.leaderBoardData = user.data.result;
        }, error => error);
    };

    $scope.displayGameLog = () => {
      angular.element('#games').addClass('active-class');
      angular.element('#leaderboard').removeClass('active-class');
      angular.element('#donations').removeClass('active-class');
      if (angular.equals($scope.gamesData, {})
      || $scope.gamesData.length === 0) {
        $scope.noDonations = false;
        $scope.donations = false;
        $scope.leaderBoard = false;
        $scope.noGameLog = true;
        $scope.gameLog = false;
        $scope.noLeaderBoard = false;
      } else {
        $scope.noDonations = false;
        $scope.donations = false;
        $scope.leaderBoard = false;
        $scope.noGameLog = false;
        $scope.gameLog = true;
        $scope.noLeaderBoard = false;
      }
    };

    $scope.displayLeaderBoard = () => {
      angular.element('#games').removeClass('active-class');
      angular.element('#leaderboard').addClass('active-class');
      angular.element('#donations').removeClass('active-class');
      if ($scope.leaderBoardData === {}) {
        $scope.noLeaderBoard = true;
        $scope.leaderBoard = false;
        $scope.gameLog = false;
        $scope.noGameLog = false;
        $scope.donations = false;
        $scope.noDonations = false;
      }
      $scope.noLeaderBoard = false;
      $scope.leaderBoard = true;
      $scope.gameLog = false;
      $scope.noGameLog = false;
      $scope.donations = false;
      $scope.noDonations = false;
    };

    $scope.displayDonations = () => {
      angular.element('#games').removeClass('active-class');
      angular.element('#leaderboard').removeClass('active-class');
      angular.element('#donations').addClass('active-class');
      if (angular.equals($scope.donationData, {})
      || $scope.notAuthorized === true) {
        $scope.noDonations = true;
        $scope.donations = false;
        $scope.leaderBoard = false;
        $scope.noGameLog = false;
        $scope.gameLog = false;
        $scope.noLeaderBoard = false;
      } else if ($scope.donationData.donations.length === 0) {
        $scope.noDonations = true;
        $scope.donations = false;
        $scope.leaderBoard = false;
        $scope.noGameLog = false;
        $scope.gameLog = false;
        $scope.noLeaderBoard = false;
      } else {
        $scope.noDonations = false;
        $scope.donations = true;
        $scope.leaderBoard = false;
        $scope.noGameLog = false;
        $scope.gameLog = false;
        $scope.noLeaderBoard = false;
      }
    };

    $scope.getDonations();
    $scope.getGameLogs();
    $scope.getLeaderBoard();
  }]);
