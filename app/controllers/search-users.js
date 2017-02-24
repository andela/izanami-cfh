const mongoose = require('mongoose');
const User = mongoose.model('User');

/**
 * search for users from the database base on email
 */
exports.users = (req, res) => {
  const query = req.params.invitedUserEmail || '';
  User.find({ email: { $regex: query } }).limit(10)
    .exec((err, result) => {
      if (err) {
        return res.json(err);
      }
      res.json(result);
    });
};