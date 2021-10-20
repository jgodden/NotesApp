const { DateTime } = require("luxon");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AccountSchema = new Schema({
    _name: { type: String },
    _plan: { type: String }
  }
);

module.exports = mongoose.model('Account', AccountSchema);