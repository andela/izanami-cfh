const mongoose = require('mongoose');

const NotificationModel = mongoose.model('Notification');

exports.saveNotification = (notificationData, callback) => {
  const newNotification = new NotificationModel({
    user: notificationData.reciever,
    type: 'invite',
    link: `http://localhost:3000/#!/app?game=${notificationData.link}`,
    message: `${notificationData.sender} wants you to join a game`
  });

  newNotification.save((err) => {
    if (!err) {
      callback({ status: 'success', message: 'notification saved' });
    } else {
      callback({ status: 'error', message: err });
    }
  });
};

exports.getNotification = (req, res) => {
  let notifications = null;
  if (req.params) {
    NotificationModel.find({ user: req.params.id }, (err, notification) => {
      if (notification) {
        notifications = notification;
        res.json(notifications);
      } else {
        res.status({ status: 404, message: 'Not found' });
      }
    });
  } else {
    NotificationModel.findAll({}, (err, notification) => {
      res.json(notification);
    });
  }
};

exports.updateRead = (user) => {
  let error = null;
  if (user) {
    NotificationModel.findOne({ _id: user, type: 'invite' },
    (err, notification) => {
      notification.read = true;
      notification.save((err) => {
        if (err) {
          error = err;
        }
      });
    });
  }
  return error;
};
