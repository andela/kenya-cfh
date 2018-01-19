/* eslint-disable import/no-dynamic-require */  		  
import async from "async";
import underscore from "underscore";

const questions = require(`${__dirname}/../../app/controllers/questions.js`);
const answers = require(`${__dirname}/../../app/controllers/answers.js`);
const guestNames = [
  "Disco Potato",
  "Silver Blister",
  "Insulated Mustard",
  "Funeral Flapjack",
  "Toenail",
  "Urgent Drip",
  "Raging Bagel",
  "Aggressive Pie",
  "Loving Spoon",
  "Swollen Node",
  "The Spleen",
  "Dingle Dangle"
];

/**
 * @class Game
 *
 */
class Game {
  /**
   *
   * @param {number} gameID
   * @param {obj} io
   */
  constructor(gameID, io) {
    this.io = io;
    this.gameID = gameID;
    this.players = [];
    this.table = [];
    this.winningCard = -1;
    this.gameWinner = -1;
    this.winnerAutopicked = false;
    this.czar = -1;
    this.playerMinLimit = 3;
    this.playerMaxLimit = 12;
    this.pointLimit = 5;
    this.state = "awaiting players";
    this.round = 0;
    this.questions = null;
    this.answers = null;
    this.curQuestion = null;
    this.timeLimits = {
      stateChoosing: 21,
      stateJudging: 16,
      stateResults: 6
    };
    this.choosingTimeout = 0;
    this.judgingTimeout = 0;
    this.resultsTimeout = 0;
    this.guestNames = guestNames.slice();
  }

  /**
   * @returns {obj} payload
   */
  payload() {
    const players = [];
    this.players.forEach(player => {
      players.push({
        hand: player.hand,
        points: player.points,
        username: player.username,
        avatar: player.avatar,
        premium: player.premium,
        socketID: player.socket.id,
        color: player.color
      });
    });
    return {
      gameID: this.gameID,
      players,
      czar: this.czar,
      state: this.state,
      round: this.round,
      gameWinner: this.gameWinner,
      winningCard: this.winningCard,
      winningCardPlayer: this.winningCardPlayer,
      winnerAutopicked: this.winnerAutopicked,
      table: this.table,
      pointLimit: this.pointLimit,
      curQuestion: this.curQuestion
    };
  }

  /**
   * @returns {void} sendNotification
   * @param {string} message
   */
  sendNotification(message) {
    this.io.sockets
      .in(this.gameID)
      .emit("notification", { notification: message });
  }

  /**
   *  Currently called on each joinGame event from socket.js
   *  Also called on removePlayer IF game is in 'awaiting players' state
   * @return {void} assignPlayerColors
   */
  assignPlayerColors() {
    this.players.forEach((player, index) => {
      player.color = index;
    });
  }

  /**
   * @returns {void} assignGuestNames
   */
  assignGuestNames() {
    const self = this;
    this.players.forEach(player => {
      if (player.username === "Guest") {
        const randIndex = Math.floor(Math.random() * self.guestNames.length);
        player.username = self.guestNames.splice(randIndex, 1)[0];
        if (!self.guestNames.length) {
          self.guestNames = guestNames.slice();
        }
      }
    });
  }

  /**
   * @returns {void} prepareGame
   */
  prepareGame() {
    this.state = "game in progress";

    this.io.sockets.in(this.gameID).emit("prepareGame", {
      playerMinLimit: this.playerMinLimit,
      playerMaxLimit: this.playerMaxLimit,
      pointLimit: this.pointLimit,
      timeLimits: this.timeLimits
    });

    const self = this;
    async.parallel([this.getQuestions, this.getAnswers], (err, results) => {
      self.questions = results[0];
      self.answers = results[1];

      self.startGame();
    });
  }

  /**
   * @returns {void} startGame
   */
  startGame() {
    this.shuffleCards(this.questions);
    this.shuffleCards(this.answers);
    this.newCzar(this);
    this.sendUpdate();
  }

  /**
   * @returns {void} sendUpdate
   */
  sendUpdate() {
    this.io.sockets.in(this.gameID).emit("gameUpdate", this.payload());
  }

  /**
   * @param {obj} self
   * @returns {void} stateChoosing
   */
  stateChoosing(self) {
    self.state = "waiting for players to pick";
    self.table = [];
    self.winningCard = -1;
    self.winningCardPlayer = -1;
    self.winnerAutopicked = false;
    self.curQuestion = self.questions.pop();
    if (!self.questions.length) {
      self.getQuestions((err, data) => {
        self.questions = data;
      });
    }
    self.round += 1;
    self.dealAnswers();
    self.sendUpdate();

    self.choosingTimeout = setTimeout(() => {
      self.stateJudging(self);
    }, self.timeLimits.stateChoosing * 1000);
  }

  /**
   * @returns {void} selectFirst
   */
  selectFirst() {
    if (this.table.length) {
      this.winningCard = 0;
      const winnerIndex = this.findPlayerIndexBySocket(this.table[0].player);
      this.winningCardPlayer = winnerIndex;
      this.players[winnerIndex].points += 1;
      this.winnerAutopicked = true;
      this.stateResults(this);
    } else {
      this.stateChoosing(this);
    }
  }

  /**
   *
   * @param {obj} self
   * @returns {void} stateJudging
   */
  stateJudging(self) {
    self.state = "waiting for czar to decide";

    if (self.table.length <= 1) {
      self.selectFirst();
    } else {
      self.sendUpdate();
      self.judgingTimeout = setTimeout(() => {
        self.selectFirst();
      }, self.timeLimits.stateJudging * 1000);
    }
  }

  /**
   *
   * @param {obj} self
   * @returns {void} stateResults
   */
  stateResults(self) {
    self.state = "winner has been chosen";
    let winner = -1;

    self.players.map((player, index) => {
      if (player.points >= self.pointLimit) {
        winner = index;
      }
    });

    self.sendUpdate();
    self.resultsTimeout = setTimeout(() => {
      if (winner !== -1) {
        self.stateEndGame(winner);
      } else {
        self.newCzar(self);
      }
    }, self.timeLimits.stateResults * 1000);
  }

  /**
   *
   * @param {number} winner
   * @returns {void} stateEndGame
   */
  stateEndGame(winner) {
    this.state = 'game ended';
    this.gameWinner = winner;
    const gamePlayers = this.players.map(player => player.username); 
    this.sendUpdate();
    const gameData = {
      gamePlayers,
      gameRound: this.round,
      gameID: this.gameID,
      gameWinner: this.players[winner].username
    }; 
    this.io.sockets.in(this.gameID).emit('saveGame', gameData);
  }

  /**
   * @returns {void} stateDissolveGame
   */
  stateDissolveGame() {
    this.state = "game dissolved";
    this.sendUpdate();
  }

  /**
   *
   * @param {function} callback
   * @returns {void} getQuestions
   */
  getQuestions(callback) {
    questions.allQuestionsForGame(questions => {
      callback(null, questions);
    });
  }

  /**
   *
   * @param {function} callback
   * @returns {void} getAnswers
   */
  getAnswers(callback) {
    answers.allAnswersForGame(answers => {
      callback(null, answers);
    });
  }

  /**
   *
   * @param {array} cards
   * @returns {array} shuffleCards
   */
  shuffleCards(cards) {
    let shuffleIndex = cards.length;
    let temp;
    let randomNumber;

    while (shuffleIndex) {
      randomNumber = Math.floor(Math.random() * shuffleIndex--);
      temp = cards[randomNumber];
      cards[randomNumber] = cards[shuffleIndex];
      cards[shuffleIndex] = temp;
    }
    return cards;
  }

  /**
   *
   * @param {number} maxAnswers
   * @returns {void} dealAnswers
   */
  dealAnswers(maxAnswers) {
    maxAnswers = maxAnswers || 10;
    const storeAnswers = (err, data) => {
      this.answers = data;
    };

    this.players.map(player => {
      while (player.hand.length < maxAnswers) {
        player.hand.push(this.answers.pop());
        if (!this.answers.length) {
          this.getAnswers(storeAnswers);
        }
      }
    });
  }

  /**
   *
   * @param {number} player
   * @returns {number} findPlayerIndexBySocket
   */
  findPlayerIndexBySocket(player) {
    let playerIndex = -1;
    underscore.each(this.players, (thePlayer, index) => {
      if (thePlayer.socket.id === player) {
        playerIndex = index;
      }
    });
    return playerIndex;
  }

  /**
   *
   * @param {array} cardArray
   * @param {number} player
   * @returns {void} pickCards
   */
  pickCards(cardArray, player) {
    if (this.state === "waiting for players to pick") {
      let playerIndex = this.findPlayerIndexBySocket(player);
      if (playerIndex !== -1) {
        let previouslySubmitted = false;
        underscore.each(this.table, (pickedSet, index) => {
          if (pickedSet.player === player) {
            previouslySubmitted = true;
          }
        });
        if (!previouslySubmitted) {
          const tableCard = [];
          cardArray.map((card, index) => {
            let cardIndex = null;

            this.players[playerIndex].hand.map(
              (thePlayerHand, thePlayerHandIndex) => {
                if (thePlayerHand.id === cardArray[index]) {
                  cardIndex = thePlayerHandIndex;
                }
              }
            );

            if (cardIndex !== null) {
              tableCard.push(
                this.players[playerIndex].hand.splice(cardIndex, 1)[0]
              );
            }
          });

          if (tableCard.length === this.curQuestion.numAnswers) {
            this.table.push({
              card: tableCard,
              player: this.players[playerIndex].socket.id
            });
          }
          if (this.table.length === this.players.length - 1) {
            clearTimeout(this.choosingTimeout);
            this.stateJudging(this);
          } else {
            this.sendUpdate();
          }
        }
      }
    }
  }

  /**
   *
   * @param {number} player
   * @returns {obj} getPlayer
   */
  getPlayer(player) {
    const playerIndex = this.findPlayerIndexBySocket(player);
    if (playerIndex > -1) {
      return this.players[playerIndex];
    }
    return {};
  }

  /**
   *
   * @param {number} thePlayer
   * @returns {void} removePlayer
   */
  removePlayer(thePlayer) {
    const playerIndex = this.findPlayerIndexBySocket(thePlayer);

    if (playerIndex !== -1) {
      const playerName = this.players[playerIndex].username;

      this.table.map((player, index) => {
        if (player === thePlayer) {
          this.table.splice(index, 1);
        }
      });

      this.players.splice(playerIndex, 1);

      if (this.state === "awaiting players") {
        this.assignPlayerColors();
      }

      if (this.czar === playerIndex) {
        if (this.state === "waiting for players to pick") {
          clearTimeout(this.choosingTimeout);
          this.sendNotification(
            "The Czar left the game!" + "Starting a new round."
          );
          return this.stateChoosing(this);
        } else if (this.state === "waiting for czar to decide") {
          this.sendNotification(
            "The Czar left the game! " + "First answer submitted wins!"
          );
          this.pickWinning(this.table[0].card[0].id, thePlayer, true);
        }
      } else {
        if (playerIndex < this.czar) {
          this.czar -= 1;
        }
        this.sendNotification(`${playerName} has left the game!`);
      }
      this.sendUpdate();
    }
  }

  /**
   *
   * @param {number} card
   * @param {number} player
   * @param {number} autopicked
   * @returns {void} pickWinning
   */
  pickWinning(card, player, autopicked) {
    autopicked = autopicked || false;
    const playerIndex = this.findPlayerIndexBySocket(player);
    if (
      (playerIndex === this.czar || autopicked) &&
      this.state === "waiting for czar to decide"
    ) {
      let cardIndex = -1;
      underscore.each(this.table, (winningSet, index) => {
        if (winningSet.card[0].id === card) {
          cardIndex = index;
        }
      });

      if (cardIndex !== -1) {
        this.winningCard = cardIndex;
        const winnerIndex = this.findPlayerIndexBySocket(
          this.table[cardIndex].player
        );
        this.sendNotification(`${this.players[winnerIndex].username} 
        has won the round!`);

        this.winningCardPlayer = winnerIndex;
        this.players[winnerIndex].points += 1;
        clearTimeout(this.judgingTimeout);
        this.winnerAutopicked = autopicked;
        this.stateResults(this);
      }
    } else {
      this.sendUpdate();
    }
  }

  /**
   * @returns {void} killGame
   */
  killGame() {
    clearTimeout(this.resultsTimeout);
    clearTimeout(this.choosingTimeout);
    clearTimeout(this.judgingTimeout);
  }

  /**
   *
   * @param {obj} self
   * @returns {void} newCzar
   */
  newCzar(self) {
    self.state = "czar pick card";
    self.table = [];
    if (self.czar >= self.players.length - 1) {
      self.czar = 0;
    } else {
      self.czar += 1;
    }
    self.sendUpdate();
  }

  /**
   *
   * @param {obj} self
   * @returns {void} startNextGameRound
   */
  startNextGameRound(self) {
    if (self.state === "czar pick card") {
      self.stateChoosing(self);
    } else if (self.state === "czar left game") {
      self.newCzar(self);
    }
  }
}

export default Game;
