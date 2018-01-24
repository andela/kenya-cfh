import mongoose from 'mongoose';
import * as avatars from '../../app/controllers/avatars';
import Game from './game';
import Player from './player';


require('console-stamp')(console, 'm/dd HH:MM:ss');

const DEFAULT_REGION = '59b90186ad7d37a9fb7d3630';
const User = mongoose.model('User');

const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxy';

export default (io) => {
  let game;
  const allGames = {};
  const allPlayers = {};
  const gamesNeedingPlayers = [];
  let gameID = 0;

  const createGameWithFriends = (player, socket) => {
    let isUniqueRoom = false;
    let uniqueRoom = '';

    while (!isUniqueRoom) {
      uniqueRoom = '';
      let i = 0;
      do {
        uniqueRoom += chars[Math.floor(Math.random() * chars.length)];
        i += 1;
      } while (i < 6);

      if (!allGames[uniqueRoom] && !(/^\d+$/).test(uniqueRoom)) {
        isUniqueRoom = true;
      }
    }
    game = new Game(uniqueRoom, io);
    allPlayers[socket.id] = true;
    game.players.push(player);
    allGames[uniqueRoom] = game;
    socket.join(game.gameID);
    socket.gameID = game.gameID;
    game.assignPlayerColors();
    game.assignGuestNames();
    game.sendUpdate();
  };

  const exitGame = (socket) => {
    if (allGames[socket.gameID]) {
      const game = allGames[socket.gameID];
      delete allPlayers[socket.id];
      if (game.state === 'awaiting players' ||
        game.players.length - 1 >= game.playerMinLimit) {
        game.removePlayer(socket.id);
      } else {
        game.stateDissolveGame();

        game.players.map((player) => {
          player.socket.leave(socket.gameID);
        });
        game.killGame();
        delete allGames[socket.gameID];
      }
    }
    socket.leave(socket.gameID);
  };

  const fireGame = (player, socket) => {
    let game;
    if (gamesNeedingPlayers.length <= 0) {
      gameID += 1;
      const gameIDStr = gameID.toString();
      game = new Game(gameIDStr, io);
      allPlayers[socket.id] = true;
      game.players.push(player);
      allGames[gameID] = game;
      gamesNeedingPlayers.push(game);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
    } else {
      [game] = gamesNeedingPlayers;
      allPlayers[socket.id] = true;
      game.players.push(player);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
      game.sendNotification(`${player.username} has joined the game!`);
      if (game.players.length >= game.playerMaxLimit) {
        gamesNeedingPlayers.shift();
      }
    }
  };


  const getGame = (player, socket, requestedGameId, createPrivate) => {
    requestedGameId = requestedGameId || '';
    createPrivate = createPrivate || false;
    if (requestedGameId.length && allGames[requestedGameId]) {
      const game = allGames[requestedGameId];

      if (game.state === 'awaiting players'
        && (!game.players.length ||
          game.players[0].socket.id !== socket.id)
        && (game.players.length < game.playerMaxLimit)) {
        allPlayers[socket.id] = true;
        game.players.push(player);
        socket.join(game.gameID);
        socket.gameID = game.gameID;
        game.assignPlayerColors();
        game.assignGuestNames();
        game.sendUpdate();
        game.sendNotification(`${player.username} has joined the game!`);
        if (game.players.length >= game.playerMaxLimit) {
          gamesNeedingPlayers.shift();
        }
      } else {
        $('#gameFilledUp').modal('show');
      }
    } else {
      if (createPrivate) {
        return createGameWithFriends(player, socket);
      }
      return fireGame(player, socket);
    }
  };

  const joinGame = (socket, gameData) => {
    const player = new Player(socket);
    gameData = gameData || {};
    player.userID = gameData.userID || 'unauthenticated';
    if (gameData.userID !== 'unauthenticated') {
      User.findOne({
        _id: gameData.userID
      }).exec((err, user) => {
        if (err) {
          return err;
        }
        if (!user) {
          player.username = 'Guest';
          player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
        } else {
          player.username = user.name;
          player.premium = user.premium || 0;
          player.avatar = user.avatar
            || avatars[Math.floor(Math.random() * 4) + 12];
        }
        getGame(player, socket, gameData.room, gameData.createPrivate);
      });
    } else {
      player.username = 'Guest';
      player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
      getGame(player, socket, gameData.room, gameData.createPrivate);
    }
  };

  io.sockets.on('connection', (socket) => {
    socket.emit('id', { id: socket.id });

    socket.on('pickCards', (gameData) => {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickCards(gameData.cards, socket.id);
      }
    });

    socket.on('pickWinning', (gameData) => {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickWinning(gameData.card, socket.id);
      }
    });

    socket.on('joinGame', (gameData) => {
      if (!allPlayers[socket.id]) {
        joinGame(socket, gameData);
      }
    });

    socket.on('joinNewGame', (gameData) => {
      exitGame(socket);
      joinGame(socket, gameData);
    });

    socket.on('startGame', (data) => {
      if (allGames[socket.gameID]) {
        const game = allGames[socket.gameID];
        game.regionId = data.regionId || DEFAULT_REGION;
        if (game.players.length >= game.playerMinLimit) {
          gamesNeedingPlayers.forEach((theGame, index) => {
            if (theGame.gameID === socket.gameID) {
              return gamesNeedingPlayers.splice(index, 1);
            }
          });
          game.prepareGame();
          game.sendNotification(`The game has begun, 
             wait for czar to draw cards`);
        }
      }
    });

    socket.on('czarSelectCard', () => {
      allGames[socket.gameID].startNextGameRound(allGames[socket.gameID]);
    });

    socket.on('leaveGame', () => {
      exitGame(socket);
    });

    socket.on('disconnect', () => {
      exitGame(socket);
    });
  });
};
