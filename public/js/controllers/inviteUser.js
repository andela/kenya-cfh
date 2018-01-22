angular.module('mean.system')
  .controller('InviteUserController', ['$scope', '$http', ($scope, $http) => {
    $scope.userNotFound = false;
    $scope.resultFound = false;


    $scope.searchUser = () => {
      const { username } = $scope;
      $scope.searchResult = [];
      if (username.length !== 0) {
        $http({
          method: 'GET',
          url: `/api/search?username=${username}`
        }).then((response) => {
          if (response.data) {
            $('#searchControl').show();
            $('#userNotFound').hide();
            $('#inviteUserButton').show();
            // $('#searchResult').show();
            $scope.searchResult = response.data.user;
            $scope.email = response.data.email;
            $scope.resultFound = true;
          }
        }, (error) => {
          $scope.userNotFound = true;
          $('#inviteUserButton').hide();
          setTimeout(() => {
            $scope.userNotFound = false;
          }, 2000);
          return error;
        });
      } else {
        $scope.searchResult = [];
      }
    };

    $scope.inviteUsers = (email) => {
      $('#searchControl').hide();
      $http.post('/api/users/invite', {
        recipient: email,
        gameLink: document.URL
      });
    };

    $scope.resetSearchTerm = () => {
      $scope.searchTerm = '';
    };

    $scope.isInvited = email => $scope.invitedUsers.indexOf(email) > -1;
  }]);
