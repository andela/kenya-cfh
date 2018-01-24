angular.module('mean.system').controller('GameController', [
  '$scope',
  'game',
  '$timeout',
  '$location',
  'MakeAWishFactsService',
  ($scope, game, $timeout, $location, MakeAWishFactsService) => {
    $scope.hasPickedCards = false;
    $scope.winningCardPicked = false;
    $scope.showTable = false;
    $scope.modalShown = false;
    $scope.game = game;
    $scope.pickedCards = [];
    let makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    $scope.makeAWishFact = makeAWishFacts.pop();
    $scope.pickCard = (card) => {
      if (!$scope.hasPickedCards) {
        if ($scope.pickedCards.indexOf(card.id) < 0) {
          $scope.pickedCards.push(card.id);
          if (game.curQuestion.numAnswers === 1) {
            $scope.sendPickedCards();
            $scope.hasPickedCards = true;
          } else if (
            game.curQuestion.numAnswers === 2 &&
            $scope.pickedCards.length === 2
          ) {
            $scope.hasPickedCards = true;
            $timeout($scope.sendPickedCards, 300);
          }
        } else {
          $scope.pickedCards.pop();
        }
      }
    };

    $scope.pointerCursorStyle = () => {
      if (
        $scope.isCzar() &&
        $scope.game.state === 'waiting for czar to decide'
      ) {
        return { cursor: 'pointer' };
      }
      return {};
    };

    $scope.sendPickedCards = () => {
      game.pickCards($scope.pickedCards);
      $scope.showTable = true;
    };

    $scope.popModal = () => {
      $('#searchControl').hide();
      $('#invite-players-modal').modal('show');
    };

    $scope.cardIsFirstSelected = (card) => {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[0];
      }
      return false;
    };

    $scope.cardIsSecondSelected = (card) => {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[1];
      }
      return false;
    };

    $scope.firstAnswer = ($index) => {
      if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
        return true;
      }
      return false;
    };

    $scope.secondAnswer = ($index) => {
      if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
        return true;
      }
      return false;
    };

    $scope.showFirst = card =>
      game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id;

    $scope.showSecond = card =>
      game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id;

    $scope.isCzar = () => game.czar === game.playerIndex;

    $scope.isPlayer = $index => $index === game.playerIndex;

    $scope.isCustomGame = () =>
      !/^\d+$/.test(game.gameID) && game.state === 'awaiting players';

    $scope.isPremium = $index => game.players[$index].premium;

    $scope.currentCzar = $index => $index === game.czar;

    $scope.winningColor = ($index) => {
      if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
        return $scope.colors[game.players[game.winningCardPlayer].color];
      }
      return '#f9f9f9';
    };

    $scope.pickWinning = (winningSet) => {
      if ($scope.isCzar()) {
        game.pickWinning(winningSet.card[0]);
        $scope.winningCardPicked = true;
      }
    };

    $scope.winnerPicked = () => game.winningCard !== -1;

    $scope.startGame = () => {
      game.startGame();
    };

    $scope.startNextGameRound = () => {
      game.startNextGameRound();
    };

    $scope.abandonGame = () => {
      game.leaveGame();
      $location.path('/');
    };
    $scope.$watch('game.round', () => {
      $scope.hasPickedCards = false;
      $scope.showTable = false;
      $scope.winningCardPicked = false;
      $scope.makeAWishFact = makeAWishFacts.pop();
      if (!makeAWishFacts.length) {
        makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      }
      $scope.pickedCards = [];
    });

    $scope.$watch('game.state', () => {
      
      if (
        game.state === 'waiting for czar to decide' &&
        $scope.showTable === false
      ) {
        $scope.showTable = true;
      }
      if (
        $scope.isCzar() &&
        game.state === 'czar pick card' &&
        game.table.length === 0
      ) {
        $('#myModal').modal('show');
      } else {
        $('.modal-close').trigger('click');
      }
    });

    $scope.checkNumOfPlayers = () => {
      if (game.players.length >= game.playerMinLimit) {
        $('#startModal').modal({
          keyboard: false,
          backdrop: 'static'
        });
        $('#startModal').modal('show');
      } else {
        $('#few-players-modal').modal('show');
      }
    };

    $scope.$watch('game.gameID', () => {
      if (game.gameID && game.state === 'awaiting players') {
        if (!$scope.isCustomGame() && $location.search().game) {
          $location.search({});
        } else if ($scope.isCustomGame() && !$location.search().game) {
          $location.search({ game: game.gameID });
          if (!$scope.modalShown) {
            setTimeout(() => {
              const link = document.URL;
              const txt = `Give the following link to your friends 
                           so they can join your game: `;
              $('#lobby-how-to-play').text(txt);
              $('#oh-el')
                .css({
                  'text-align': 'center',
                  'font-size': '22px',
                  background: 'white',
                  color: 'black'
                })
                .text(link);
            }, 200);
            $scope.modalShown = true;
          }
        }
      }
    });

    $scope.gameTour = introJs();
 
    $scope.gameTour.setOptions({
      steps: [{
        intro: 'Welcome to cards for humanity (the coolest people call it CFH). You want to play this game ? Then let me take you on a quick tour'
      },
 
      {
        element: '#question-container-outer',
        intro: 'Game needs a minimum of 3 players to start. Wait for the minimum number of players then start the game. Also when the game starts, the questions are displayed here'
      },
      {
        element: '#timer-container',
        intro: 'You have 20 seconds to submit an answer. After time out, the CZAR selects his favorite answer. Whoever submits CZAR\'s favorite answer wins the round'
      },
      {
        element: '#answers-container',
        intro: 'These are the rules of the game',
        position: 'top'
      },
      {
        element: '#abandon-game-button',
        intro: 'Played enough ? Click here to quit game'
      }
      ],
      showStepNumbers: true,
      disableInteraction: true,
      overlayOpacity: 0.5,
      showBullets: false
    });

    $scope.startGameTour = () => {
      if (!localStorage.takenTour) {
        $scope.gameTour.start();
        localStorage.setItem('takenTour', true);
      }
    };

    $scope.retakeTour = () => {
      $scope.gameTour.start();
    };


    if ($location.search().game && !/^\d+$/.test($location.search().game)) {
      game.joinGame('joinGame', $location.search().game);
    } else if ($location.search().custom) {
      game.joinGame('joinGame', null, true);
    } else {
      game.joinGame();
    }
  }
]);
