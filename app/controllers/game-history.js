const mongoose = require('mongoose');

const Game = mongoose.model('Game');


exports.getUserHistory = (req, res) => {
  Game.find({}, (err, history) => {
    if (err) {
      return res.send(err);
    }
    if (!history || Object.keys(history).length < 1) {
      return res.status(400).json({
        success: false,
        message: 'You have no Game Records yet!!'
      });
    }
    return res.status(200).json(history);
  });
};
exports.getUserGameHistory = (req, res) => {
  const query = req.params.userID || '';
  Game.find({}, (err, games) => {
    if (!err) {
      const participated = games.filter((game) => {
        let isAmong = null;
        game.players.forEach((player) => {
          if (player.id === query) {
            isAmong = game;
          }
        });
        return isAmong;
      });
      res.status(200).json(participated);
    }
  });
};
