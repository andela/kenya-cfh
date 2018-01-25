import Game from '../models/game';

/**
 * saves the game logs to database
 *
 * @export { function }
 *
 * @param { object } req request sent from body
 * @param { object } res request sent to body
 * @returns {object} returns success or failure message
 */

export const saveGameLogs = (req, res) => {
  if (req.decoded && req.params.id) {
    const game = new Game(req.body);
    game.userID = req.decoded.id;
    game.gameID = req.params.id;
    game.save()
      .then((gameData) => {
        res.status(201).send({
          message: 'Game successfully logged',
          gameLog: gameData
        });
      })
      .catch(() => res.status(400).send({ message: 'Game logs not saved' }));
  }
};


/**
 * get all top winning players
 *
 * @param {Object} req
 * @param {Object} res
 *
 * @returns {Object} game response
 */
export const getLeaderboard = (req, res) => {
  Game.aggregate([
    { $group: { _id: '$gameWinner', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).then((result) => {
    res.status(200).send({ result });
  })
    .catch(() => res.status(500).send({ message: 'an error has occured' }));
};

/**
 * Gets game log when game session ends
 * @returns {object} description
 * @export { function }
 * @param {object} req
 * @param {object} res
 */
export const getGameLog = (req, res) => {
  if (req.decoded) {
    const userId = req.decoded.id;
    Game.aggregate([
      { $match: { userID: userId } },
      {
        $group: {
          _id: '$gameID',
          gameID: { $first: '$gameID' },
          gameRound: { $first: '$gameRound' },
          gameWinner: { $first: '$gameWinner' },
          gamePlayers: { $first: '$gamePlayers' }
        }
      }
    ])
      .exec((err, gameLog) => {
        if (err) {
          return res.status(500).send({
            message: 'Game log not succesfully retrieved',
            err
          });
        }
        return res.status(200).send(gameLog);
      });
  } else {
    return res.status(401).send({ message: 'Unauthenticated user' });
  }
};
