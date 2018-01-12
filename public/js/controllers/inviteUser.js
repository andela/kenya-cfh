angular.module('mean.system')
  .controller('InviteUserController', ['$scope', '$http', ($scope, $http) => {
    $scope.searchUser = () => {
      const { username } = $scope;
      $scope.searchResult = [];
      if (username.length !== 0) {
        $http({
          method: 'GET',
          url: `/api/search?username=${username}`
        }).then((response) => {
          console.log(response)
          if (response.data) {
            $('#searchControl').show();
            $scope.searchResult = response.data.user;
            $scope.email = response.data.email
          }
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
      })
    }

    $scope.resetSearchTerm = () => {
      $scope.searchTerm = '';
    };

    $scope.isInvited = email => $scope.invitedUsers.indexOf(email) > -1;
  }]);