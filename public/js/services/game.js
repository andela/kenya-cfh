angular.module('mean.system')
  .factory(
    'game',
    ['socket', '$timeout', '$http', (socket, $timeout, $http) => {
      const game = {
        id: null, // This player's socket ID, so we know who this player is
        gameID: null,
        players: [],
        playerIndex: 0,
        winningCard: -1,
        winningCardPlayer: -1,
        gameWinner: -1,
        table: [],
        czar: null,
        playerMinLimit: 3,
        playerMaxLimit: 6,
        pointLimit: null,
        state: null,
        round: 0,
        time: 0,
        curQuestion: null,
        notification: null,
        timeLimits: {},
        joinOverride: false
      };

      const notificationQueue = [];
      let timeout = false;
      let joinOverrideTimeout;

      const setNotification = () => {
        if (notificationQueue.length === 0) {
          clearInterval(timeout);
          timeout = false;
          game.notification = '';
        } else {
          game.notification = notificationQueue.shift();
          timeout = $timeout(setNotification, 1300);
        }
      };

      const addToNotificationQueue = (message) => {
        notificationQueue.push(message);
        if (!timeout) {
          setNotification();
        }
      };

      let timeSetViaUpdate = false;
      const decrementTime = () => {
        if (game.time > 0 && !timeSetViaUpdate) {
          game.time -= 1;
        } else {
          timeSetViaUpdate = false;
        }
        $timeout(decrementTime, 950);
      };

      socket.on('id', (gameData) => {
        game.id = gameData.id;
      });

      socket.on('prepareGame', (gameData) => {
        game.playerMinLimit = gameData.playerMinLimit;
        game.playerMaxLimit = gameData.playerMaxLimit;
        game.pointLimit = gameData.pointLimit;
        game.timeLimits = gameData.timeLimits;
      });

      socket.on('gameUpdate', (gameData) => {
        if (gameData.state === 'czar pick card') {
          game.czar = gameData.czar;
        }

        if (game.gameID !== gameData.gameID) {
          game.gameID = gameData.gameID;
        }

        game.joinOverride = false;
        clearTimeout(game.joinOverrideTimeout);

        gameData.players.map((player, index) => {
          if (game.id === player.socketID) {
            game.playerIndex = index;
          }
        });

        const newState = (gameData.state !== game.state);

        if (gameData.round !== game.round
          && gameData.state !== 'awaiting players'
          && gameData.state !== 'game ended'
          && gameData.state !== 'game dissolved') {
          game.time = game.timeLimits.stateChoosing - 1;
          timeSetViaUpdate = true;
        } else if (newState
            && gameData.state === 'waiting for czar to decide') {
          game.time = game.timeLimits.stateJudging - 1;
          timeSetViaUpdate = true;
        } else if (newState && gameData.state === 'winner has been chosen') {
          game.time = game.timeLimits.stateResults - 1;
          timeSetViaUpdate = true;
        }

        game.round = gameData.round;
        game.winningCard = gameData.winningCard;
        game.winningCardPlayer = gameData.winningCardPlayer;
        game.winnerAutopicked = gameData.winnerAutopicked;
        game.gameWinner = gameData.gameWinner;
        game.pointLimit = gameData.pointLimit;

        if (gameData.table.length === 0) {
          game.table = [];
        } else {
          const added = underscoreUtils.difference(
            underscoreUtils.pluck(gameData.table, 'player'),
            underscoreUtils.pluck(game.table, 'player')
          );
          const removed = underscoreUtils.difference(
            underscoreUtils.pluck(game.table, 'player'),
            underscoreUtils.pluck(gameData.table, 'player')
          );

          added.map((singleAdded) => {
            gameData.table.map((table) => {
              if (singleAdded === table.player) {
                game.table.push(table, 1);
              }
            });
          });

          removed.map((singleRemoved) => {
            game.table.map((table, tableIndex) => {
              if (singleRemoved === table.player) {
                game.table.splice(tableIndex, 1);
              }
            });
          });
        }

        if (game.state !== 'waiting for players to pick' ||
        game.players.length !== gameData.players.length) {
          game.players = gameData.players;
        }

        if (newState || game.curQuestion !== gameData.curQuestion) {
          game.state = gameData.state;
        }

        if (gameData.state === 'waiting for players to pick') {
          game.czar = gameData.czar;
          game.curQuestion = gameData.curQuestion;
          game.curQuestion.text = gameData.curQuestion.text.replace(/_/g, '<u></u>');

          if (newState) {
            if (game.czar === game.playerIndex) {
              addToNotificationQueue('You\'re the Card Czar! Please wait!');
            } else if (game.curQuestion.numAnswers === 1) {
              addToNotificationQueue('Select an answer!');
            } else {
              addToNotificationQueue('Select TWO answers!');
            }
          }
        } else if (gameData.state === 'waiting for czar to decide') {
          if (game.czar === game.playerIndex) {
            addToNotificationQueue("Everyone's done. Choose the winner!");
          } else {
            addToNotificationQueue('The czar is contemplating...');
          }
        } else if (gameData.state === 'winner has been chosen' &&
                game.curQuestion.text.indexOf('<u></u>') > -1) {
          game.curQuestion = gameData.curQuestion;
        } else if (gameData.state === 'awaiting players') {
          joinOverrideTimeout = $timeout(() => {
            game.joinOverride = true;
          }, 15000);
        } else if (gameData.state === 'game dissolved' ||
        gameData.state === 'game ended') {
          game.players[game.playerIndex].hand = [];
          game.time = 0;
        }
      });

      socket.on('notification', (gameData) => {
        addToNotificationQueue(gameData.notification);
      });

      socket.on('saveGame', (data) => {
        if (game.state === 'game ended' && window.localStorage.token) {
          $http.post(
            `api/v1/games/${game.gameID}/start`,
            data,
            { headers: { 'x-token': window.localStorage.token } }
          )
            .then(response => response, error => error);
        }
      });

      socket.on('gameFilledUp', () => {
        socket.emit($('#gameFilledUp').modal('show'));
      });

      game.joinGame = (mode, room, createPrivate) => {
        mode = mode || 'joinGame';
        room = room || '';
        createPrivate = createPrivate || false;
        const userID = !!window.user ? user._id : 'unauthenticated';
        socket.emit(mode, { userID, room, createPrivate });
      };

      game.startGame = () => {
        socket.emit('startGame');
      };

      game.startNextGameRound = () => {
        socket.emit('czarSelectCard');
      };

      game.leaveGame = () => {
        game.players = [];
        game.time = 0;
        socket.emit('leaveGame');
      };

      game.pickCards = (cards) => {
        socket.emit('pickCards', { cards });
      };

      game.pickWinning = (card) => {
        socket.emit('pickWinning', { card: card.id });
      };

      decrementTime();

      return game;
    }]
  );
