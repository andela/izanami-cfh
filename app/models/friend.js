const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FriendsSchema = new Schema({
  _id: String
}, { strict: false, _id : false, versionKey: false });

mongoose.model('Friend', FriendsSchema);
