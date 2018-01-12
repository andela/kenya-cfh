import mongoose from 'mongoose';
import Game from './game';
import Player from './player';

require('console-stamp')(console, 'm/dd HH:MM:ss');

const avatars = require(__dirname + '/../../app/controllers/avatars.js').all();
const User = mongoose.model('User');

// Valid characters to use to generate random private game IDs
const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxy';

module.exports = (io) => {
  let game;
  const allGames = {};
  const allPlayers = {};
  const gamesNeedingPlayers = [];
  let gameID = 0;

  const createGameWithFriends = (player, socket) => {
    let isUniqueRoom = false;
    let uniqueRoom = '';
    // Generate a random 6-character game ID
    while (!isUniqueRoom) {
      uniqueRoom = '';
      for (var i = 0; i < 6; i += 1) {
        uniqueRoom += chars[Math.floor(Math.random()*chars.length)];
      }
      if (!allGames[uniqueRoom] && !(/^\d+$/).test(uniqueRoom)) {
        isUniqueRoom = true;
      }
    }
    console.log(socket.id,'has created unique game',uniqueRoom);
    const thisgame = new Game(uniqueRoom,io);
    allPlayers[socket.id] = true;
    thisgame.players.push(player);
    allGames[uniqueRoom] = thisgame;
    socket.join(game.gameID);
    socket.gameID = game.gameID;
    thisgame.assignPlayerColors();
    thisgame.assignGuestNames();
    thisgame.sendUpdate();
  };

  const exitGame = (socket) => {
    console.log(socket.id,'has disconnected');
    if (allGames[socket.gameID]) { // Make sure game exists
      const game = allGames[socket.gameID];
      console.log(socket.id,'has left game',game.gameID);
      delete allPlayers[socket.id];
      if (game.state === 'awaiting players' ||
        game.players.length-1 >= game.playerMinLimit) {
        game.removePlayer(socket.id);
      } else {
        game.stateDissolveGame();
        for (var j = 0; j < game.players.length; j += 1) {
          game.players[j].socket.leave(socket.gameID);
        }
        game.killGame();
        delete allGames[socket.gameID];
      }
    }
    socket.leave(socket.gameID);
  };

  const fireGame = (player, socket) => {
    let thisgame;
    if (gamesNeedingPlayers.length <= 0) {
      gameID += 1;
      const gameIDStr = gameID.toString();
      thisgame = new Game(gameIDStr, io);
      allPlayers[socket.id] = true;
      thisgame.players.push(player);
      allGames[gameID] = thisgame;
      gamesNeedingPlayers.push(thisgame);
      socket.join(thisgame.gameID);
      socket.gameID = thisgame.gameID;
      console.log(socket.id,'has joined newly created game', thisgame.gameID);
      thisgame.assignPlayerColors();
      thisgame.assignGuestNames();
      thisgame.sendUpdate();
    } else {
      thisgame = gamesNeedingPlayers[0];
      allPlayers[socket.id] = true;
      thisgame.players.push(player);
      console.log(socket.id,'has joined game', thisgame.gameID);
      socket.join(thisgame.gameID);
      socket.gameID = thisgame.gameID;
      thisgame.assignPlayerColors();
      thisgame.assignGuestNames();
      thisgame.sendUpdate();
      thisgame.sendNotification(`${player.username} has joined the game!`);
      if (thisgame.players.length >= thisgame.playerMaxLimit) {
        gamesNeedingPlayers.shift();
        thisgame.prepareGame();
      }
    }
  };


  const getGame = (player, socket, requestedGameId, createPrivate) => {
    requestedGameId = requestedGameId || '';
    createPrivate = createPrivate || false;
    console.log(socket.id, 'is requesting room', requestedGameId);
    if (requestedGameId.length && allGames[requestedGameId]) {
      console.log('Room', requestedGameId, 'is valid');
      const thisgame = allGames[requestedGameId];
      // Ensure that the same socket doesn't try to join the same game
      // This can happen because we rewrite the browser's URL to reflect
      // the new game ID, causing the view to reload.
      // Also checking the number of players, so node doesn't crash when
      // no one is in this custom room.
      if (thisgame.state === 'awaiting players' && (!thisgame.players.length ||
        thisgame.players[0].socket.id !== socket.id)) {
        // Put player into the requested game
        console.log('Allowing player to join', requestedGameId);
        allPlayers[socket.id] = true;
        thisgame.players.push(player);
        socket.join(thisgame.gameID);
        socket.gameID = game.gameID;
        thisgame.assignPlayerColors();
        thisgame.assignGuestNames();
        thisgame.sendUpdate();
        thisgame.sendNotification(`${player.username} has joined the game!`);
        if (thisgame.players.length >= thisgame.playerMaxLimit) {
          gamesNeedingPlayers.shift();
          thisgame.prepareGame();
        }
      } else {
        // TODO: Send an error message back to 
        // this user saying the game has already started
      }
    } else {
      // Put players into the general queue
      console.log('Redirecting player', socket.id, 'to general queue');
      if (createPrivate) {
        createGameWithFriends(player, socket);
      } else {
        fireGame(player, socket);
      }
    }
  };

  const joinGame = (socket, data) => {
    const player = new Player(socket);
    data = data || {};
    player.userID = data.userID || 'unauthenticated';
    if (data.userID !== 'unauthenticated') {
      User.findOne({
        _id: data.userID
      }).exec((err, user) => {
        if (err) {
          console.log('err', err);
          return err; // Hopefully this never happens.
        }
        if (!user) {
          // If the user's ID isn't found (rare)
          player.username = 'Guest';
          player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
        } else {
          player.username = user.name;
          player.premium = user.premium || 0;
          player.avatar = user.avatar
          || avatars[Math.floor(Math.random() * 4) + 12];
        }
        getGame(player, socket, data.room, data.createPrivate);
      });
    } else {
      // If the user isn't authenticated (guest)
      player.username = 'Guest';
      player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
      getGame(player, socket, data.room, data.createPrivate);
    }
  };

  io.sockets.on('connection',  (socket) => {
    console.log(`${socket.id}Connected`);
    socket.emit('id', { id: socket.id });

    socket.on('pickCards', (data) => {
      console.log(socket.id, 'picked"', data);
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickCards(data.cards,socket.id);
      } else {
        console.log('Received pickCard from',
          socket.id, 'but game does not appear to exist!'
        );
      }
    });

    socket.on('pickWinning', (data) => {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickWinning(data.card,socket.id);
      } else {
        console.log('Received pickWinning from', socket.id,
          'but game does not appear to exist!'
        );
      }
    });

    socket.on('joinGame', (data) => {
      if (!allPlayers[socket.id]) {
        joinGame(socket, data);
      }
    });

    socket.on('joinNewGame', (data) => {
      exitGame(socket);
      joinGame(socket, data);
    });

    socket.on('startGame', () => {
      if (allGames[socket.gameID]) {
        const thisGame = allGames[socket.gameID];
        console.log(
          'comparing', thisGame.players[0].socket.id,
          'with', socket.id
        );
        if (thisGame.players.length >= thisGame.playerMinLimit) {
          // Remove this game from gamesNeedingPlayers
          // so new players can't join it.
          gamesNeedingPlayers.forEach((theGame, index) => {
            if (theGame.gameID === socket.gameID) {
              return gamesNeedingPlayers.splice(index, 1);
            }
          });
          thisGame.prepareGame();
          thisGame.sendNotification(`The game has begun, 
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
      console.log('Rooms on Disconnect ', io.sockets.manager.rooms);
      exitGame(socket);
    });
  });
};
