angular.module('mean.system')
  .factory('game', ['socket', '$timeout', (socket, $timeout) => {
    const game = {
      id: null,
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
    const self = this;
    let joinOverrideTimeout = 0;

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

    socket.on('id', (data) => {
      game.id = data.id;
    });

    socket.on('prepareGame', (data) => {
      game.playerMinLimit = data.playerMinLimit;
      game.playerMaxLimit = data.playerMaxLimit;
      game.pointLimit = data.pointLimit;
      game.timeLimits = data.timeLimits;
    });

    socket.on('gameUpdate', (data) => {
      if (data.state === 'czar pick card') {
        game.czar = data.czar;
      }

      if (game.gameID !== data.gameID) {
        game.gameID = data.gameID;
      }

      game.joinOverride = false;
      clearTimeout(game.joinOverrideTimeout);

      data.players.map((player, index) => {
        if (game.id === player.socketID) {
          game.playerIndex = index;
        }
      });

      const newState = (data.state !== game.state);

      if (data.round !== game.round && data.state !== 'awaiting players' &&
      data.state !== 'game ended' && data.state !== 'game dissolved') {
        game.time = game.timeLimits.stateChoosing - 1;
        timeSetViaUpdate = true;
      } else if (newState && data.state === 'waiting for czar to decide') {
        game.time = game.timeLimits.stateJudging - 1;
        timeSetViaUpdate = true;
      } else if (newState && data.state === 'winner has been chosen') {
        game.time = game.timeLimits.stateResults - 1;
        timeSetViaUpdate = true;
      }

      game.round = data.round;
      game.winningCard = data.winningCard;
      game.winningCardPlayer = data.winningCardPlayer;
      game.winnerAutopicked = data.winnerAutopicked;
      game.gameWinner = data.gameWinner;
      game.pointLimit = data.pointLimit;

      if (data.table.length === 0) {
        game.table = [];
      } else {
        const added = _.difference(
          _.pluck(data.table, 'player'),
          _.pluck(game.table, 'player')
        );
        const removed = _.difference(
          _.pluck(game.table, 'player'),
          _.pluck(data.table, 'player')
        );

        added.map((singleAdded) => {
          data.table.map((table) => {
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
       game.players.length !== data.players.length) {
        game.players = data.players;
      }

      if (newState || game.curQuestion !== data.curQuestion) {
        game.state = data.state;
      }

      if (data.state === 'waiting for players to pick') {
        game.czar = data.czar;
        game.curQuestion = data.curQuestion;
        game.curQuestion.text = data.curQuestion.text.replace(/_/g, '<u></u>');

        if (newState) {
          if (game.czar === game.playerIndex) {
            addToNotificationQueue('You\'re the Card Czar! Please wait!');
          } else if (game.curQuestion.numAnswers === 1) {
            addToNotificationQueue('Select an answer!');
          } else {
            addToNotificationQueue('Select TWO answers!');
          }
        }
      } else if (data.state === 'waiting for czar to decide') {
        if (game.czar === game.playerIndex) {
          addToNotificationQueue("Everyone's done. Choose the winner!");
        } else {
          addToNotificationQueue('The czar is contemplating...');
        }
      } else if (data.state === 'winner has been chosen' &&
              game.curQuestion.text.indexOf('<u></u>') > -1) {
        game.curQuestion = data.curQuestion;
      } else if (data.state === 'awaiting players') {
        joinOverrideTimeout = $timeout(() => {
          game.joinOverride = true;
        }, 15000);
      } else if (data.state === 'game dissolved' ||
       data.state === 'game ended') {
        game.players[game.playerIndex].hand = [];
        game.time = 0;
      }
    });

    socket.on('notification', (data) => {
      addToNotificationQueue(data.notification);
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
  }]);
