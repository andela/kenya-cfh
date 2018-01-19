const mongoose = require('mongoose');

const { Schema } = mongoose;

const gameSchema = new Schema({
  userID: [],
  gameID: String,
  gamePlayers: [],
  gameRound: Number,
  gameWinner: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Game', gameSchema);