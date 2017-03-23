const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  created_on: { type: Date, default: Date.now },
  user: String,
  message: String,
  type: String,
  sender: Object,
  link: String,
  read: { type: Boolean, default: false }
});

mongoose.model('Notification', NotificationSchema);
