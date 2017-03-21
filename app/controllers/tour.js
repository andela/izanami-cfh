const mongoose = require('mongoose');

const GameTourModel = mongoose.model('GameTour');

/**
 * search if user has taken tour
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} returns JSON object of users
 */
exports.searchTour = (req, res) => {
  const query = req.params.userID || '';
  GameTourModel.findOne({ user_id: query })
    .exec((err, result) => {
      if (err) {
        return res.json({ message: err });
      }
      res.json({ message: (result != null) ? result.length : 0 });
    });
};

exports.saveTour = (req, res) => {
  GameTourModel.findOne({
    user_id: req.body.user_id
  }).exec((err, existing) => {
    if (existing) {
      return res.status(409).json({ message: 'tour is already taken' });
    }
    const userTourTaken = new GameTourModel({
      user_id: req.body.user_id
    });
    userTourTaken.save((err, result) => {
      if (!err) {
        res.json({ message: 'saved' });
      } else {
        // This happens when there is an error saving game
        res.json({ message: 'saving failed' });
      }
    });
  });
};
