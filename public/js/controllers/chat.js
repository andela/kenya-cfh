angular.module("mean.system").controller("Chat", [
  "$scope",
  "$firebaseArray",
  "game",
  ($scope, $firebaseArray, game) => {
    const ref = new Firebase("https://cfh-chat-4121e.firebaseio.com");
    $scope.chatMessages = $firebaseArray(ref);
    $scope.message = "";
    $scope.newMessage = "";

    $scope.downScrollPane = () => {
      $(".msg_container_base")
        .stop()
        .animate(
          {
            scrollTop: $(".msg_container_base")[0].scrollHeight
          },
          1000
        );
    };

    $scope.forwardMessage = keyEvent => {
      if (keyEvent.which === 13) {
        $scope.player = game.players[game.playerIndex];
        $scope.payLoad = {
          avatar: $scope.player.avatar,
          username: $scope.player.username,
          message: $scope.message,
          timeSent: new Date(Date.now()).toLocaleTimeString("en-US")
        };
        $scope.chatMessages.$add($scope.payLoad);
        $scope.message = "";
      }
    };
  }
]);
