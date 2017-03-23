const mongoose = require('mongoose');

const FriendsModel = mongoose.model('Friend');
const NotificationModel = mongoose.model('Notification');

/**
* Deletes a notification from notifications collection
* @param {String} user - id of the reciepient
* @param {String} sender - id of the sender
* @param {Function} callback - function to call after notification is deleted
* @returns {any} calls the callback function and pass it an argument
*/
function deleteNotification(user, sender, callback) {
  NotificationModel.findOne({ user, link: sender }, (err, notification) => {
    if (notification) {
      notification.remove();
      callback({ status: 'success', msg: 'notification removed' });
    } else {
      callback(404);
    }
  });
}

exports.reqStatus = (req, res) => {
  NotificationModel.findOne({
    user: req.params.user,
    link: req.params.sender,
    type: 'friends' }, (err, notification) => {
    if (notification) {
      res.json({ status: 'pending', message: 'Friend request sent' });
    } else {
      FriendsModel.findOne({ _id: req.params.sender }, (err, friends) => {
        if (friends) {
          if (friends.get(req.params.user)) {
            res.json({ status: 'accepted', message: 'You are friends' });
          } else {
            res.json({ status: 'none', message: 'Add as a friend' });
          }
        } else {
          res.json({ status: 'none', message: 'Add as a friend' });
        }
      });
    }
  });
};

exports.getAll = (req, res) => {
  FriendsModel.find({ _id: req.params.id }, (err, response) => {
    if (!err) {
      res.json(response);
    } else {
      res.status(412);
    }
  });
};

exports.sendReq = (req, res) => {
  const friends = new NotificationModel({
    user: req.body.id,
    type: 'friends',
    link: req.body.sender._id,
    sender: req.body.sender,
    message: `${req.body.sender.name} wants to add you as a friend`,
  });

  friends.save((err, friend) => {
    if (!err) {
      res.json(friend);
    } else {
      res.sendStatus(412);
    }
  });
};

exports.acceptReq = (req, res) => {
  FriendsModel.findOne({ _id: req.body.user }, (err, response) => {
    if (response) {
      const senderID = req.body.sender._id;
      response.set(senderID, req.body.sender);
      response.save(() => {
        deleteNotification(req.body.user, req.body.sender._id, (status) => {
          if (status) {
            res.json(status);
          } else if (status === 404) {
            res.status(200);
          } else {
            res.status(500);
          }
        });
      });
    } else {
      const sender = req.body.sender._id;
      const friendsData = { _id: req.body.user };
      friendsData[sender] = req.body.sender;
      const friends = new FriendsModel(friendsData);
      friends.save();
      deleteNotification(req.body.user, req.body.sender._id, (status) => {
        if (status) {
          res.json(status);
        } else if (status === 404) {
          res.status(200);
        } else {
          res.status(500);
        }
      });
    }
  });
};

exports.rejectReq = (req, res) => {
  deleteNotification(req.body.user, req.body.sender, (message) => {
    if (message) {
      res.json(message);
    } else {
      res.status(500);
    }
  });
};
