const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GameTourSchema = new Schema({
  user_id: String,
  created_on: { type: Date, default: Date.now }
});

mongoose.model('GameTour', GameTourSchema);
