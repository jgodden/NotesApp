const { DateTime } = require("luxon");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var LoginSchema = new Schema({
    _user: { type: Schema.ObjectId, ref: 'User' },
    _username: { type: String, required: true }
  }
);

module.exports = mongoose.model('Login', LoginSchema);