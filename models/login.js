const { DateTime } = require("luxon");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var LoginSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    username: { type: String, required: true }
  }
);

module.exports = mongoose.model('Login', LoginSchema);