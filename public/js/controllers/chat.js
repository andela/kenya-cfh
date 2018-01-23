angular.module('mean.system').controller('Chat', [
  '$scope',
  '$firebaseArray',
  'game',
  ($scope, $firebaseArray, game) => {
    const ref
      = new Firebase(`https://cfh-chat-4121e.firebaseio.com/${game.gameID}`);
    $scope.chatMessages = $firebaseArray(ref);
    $scope.message = '';
    $scope.newMessage = '';
    let previousMessageCount = 0;
    let unreadMessageCount = 0;
    let newMessageCount = 0;
    const toggleChatPanel = false;

    $scope.$watch(() => {
      if (!toggleChatPanel) {
        newMessageCount = $scope.chatMessages.length;
        unreadMessageCount = newMessageCount - previousMessageCount;
        $scope.unreadMessageCount
          = unreadMessageCount <= 0 ? null : unreadMessageCount;
      } else {
        previousMessageCount = $scope.chatMessages.length;
        $scope.unreadMessageCount = null;
      }
    });

    $scope.downScrollPane = () => {
      $('.target-messages')
        .stop()
        .animate(
          {
            scrollTop: $('.target-messages')[0].scrollHeight
          },
          1000
        );
    };

    $scope.forwardMessage = (keyEvent) => {
      if (keyEvent.which === 13 && $scope.message !== '') {
        $scope.player = game.players[game.playerIndex];
        $scope.payLoad = {
          avatar: $scope.player.avatar,
          username: $scope.player.username,
          message: $scope.message,
          timeSent: new Date(Date.now()).toLocaleTimeString('en-US')
        };
        $scope.chatMessages.$add($scope.payLoad);
        $scope.downScrollPane();
        $scope.message = '';
      }
    };

    $(document).ready(() => {
      const emoji = $('#btn-input').emojioneArea({
        autoHideFilters: true,
        pickerPosition: 'top',
        recentEmojis: true,
        placeholder: 'Type a message',
        events: {
          keyup: (editor, event) => {
            if (event.which === 13) {
              $scope.message = emoji.data('emojioneArea').getText();
              emoji.data('emojioneArea').setText('');
              $scope.forwardMessage(event);
            } else {
              $scope.message = emoji.data('emojioneArea').getText();
            }
          }
        }
      });
    });
  }
]);
