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
    $scope.leaderBoardError = false;
    $scope.donationError = false;
    $scope.gameError = false;
    $scope.showGameError = false;
    $scope.showLeaderError = false;
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
      }, (error) => {
        $scope.notAuthorized = true;
        $scope.donationError = error.data.message;
      });
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
      }, (error) => {
        $scope.gameError = error.data.message;
        $scope.showGameError = true;
      });
    };

    $scope.getLeaderBoard = () => {
      $http.get('api/v1/games/leaderboard')
        .then((user) => {
          $scope.leaderBoardData = user.data.result;
        }, () => {
          $scope.leaderBoardError = 'A server error occured';
          $scope.showLeaderError = true;
        });
    };

    $scope.displayGameLog = () => {
      angular.element('#games').addClass('active-class');
      angular.element('#leaderboard').removeClass('active-class');
      angular.element('#donations').removeClass('active-class');
      if ($scope.gameError !== false) {
        $scope.noDonations = false;
        $scope.donations = false;
        $scope.leaderBoard = false;
        $scope.noGameLog = false;
        $scope.gameLog = false;
        $scope.noLeaderBoard = false;
        $scope.showLeaderError = false;
        $scope.showGameError = true;
      } else if (angular.equals($scope.gamesData, {})
      || $scope.gamesData.length === 0) {
        $scope.showGameError = false;
        $scope.noDonations = false;
        $scope.donations = false;
        $scope.leaderBoard = false;
        $scope.noGameLog = true;
        $scope.gameLog = false;
        $scope.noLeaderBoard = false;
        $scope.showLeaderError = false;
      } else {
        $scope.noDonations = false;
        $scope.donations = false;
        $scope.leaderBoard = false;
        $scope.noGameLog = false;
        $scope.gameLog = true;
        $scope.noLeaderBoard = false;
        $scope.showGameError = false;
        $scope.showLeaderError = false;
      }
    };

    $scope.displayLeaderBoard = () => {
      angular.element('#games').removeClass('active-class');
      angular.element('#leaderboard').addClass('active-class');
      angular.element('#donations').removeClass('active-class');
      if ($scope.leaderBoardError !== false) {
        $scope.noDonations = false;
        $scope.donations = false;
        $scope.leaderBoard = false;
        $scope.noGameLog = false;
        $scope.gameLog = false;
        $scope.noLeaderBoard = false;
        $scope.showLeaderError = false;
        $scope.showGameError = false;
        $scope.showLeaderError = true;
      }
      if ($scope.leaderBoardData === {}) {
        $scope.noLeaderBoard = true;
        $scope.leaderBoard = false;
        $scope.gameLog = false;
        $scope.noGameLog = false;
        $scope.donations = false;
        $scope.noDonations = false;
        $scope.showLeaderError = false;
      }
      $scope.noLeaderBoard = false;
      $scope.leaderBoard = true;
      $scope.gameLog = false;
      $scope.noGameLog = false;
      $scope.donations = false;
      $scope.noDonations = false;
      $scope.showGameError = false;
      $scope.showLeaderError = false;
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
        $scope.showGameError = false;
      } else if ($scope.donationData.donations.length === 0) {
        $scope.noDonations = true;
        $scope.donations = false;
        $scope.leaderBoard = false;
        $scope.noGameLog = false;
        $scope.gameLog = false;
        $scope.noLeaderBoard = false;
        $scope.showGameError = false;
      } else {
        $scope.noDonations = false;
        $scope.donations = true;
        $scope.leaderBoard = false;
        $scope.noGameLog = false;
        $scope.gameLog = false;
        $scope.noLeaderBoard = false;
        $scope.showGameError = false;
      }
    };

    $scope.getDonations();
    $scope.getGameLogs();
    $scope.getLeaderBoard();
  }]);
