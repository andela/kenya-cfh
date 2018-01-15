import Game from '../models/game';

/**
 * @export { function }
 * @param { object } req
 * @param { object } res
 * @returns {object}
 */

const saveGameLogs = (req, res) => {
  if (req.decoded && req.params.id) {
    const game = new Game(req.body);
    game.userID = req.decoded.id;
    game.gameID = req.params.id;
    game.save()
      .then((savedGame) => {
        res.status(201).send({
          message: 'Game successfully logged',
          gameLog: savedGame
        });
      })
      .catch(() => res.status(400).send({ message: 'Game logs not saved' }));
  }
};

export default saveGameLogs;
