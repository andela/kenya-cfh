import Game from '../models/game';

/**
 * saves the game logs to database
 *
 * @export { function }
 *
 * @param { object } req request sent from body
 * @param { object } res request sent to body
 * @returns {object}
 */

const saveGameLogs = (req, res) => {
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

export default saveGameLogs;
