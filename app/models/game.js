const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  created_on: { type: Date, default: Date.now },
  created_by: String,
  winner: String,
  number_of_players: String,
  game_id: String,
  players: Array
});

mongoose.model('Game', GameSchema);