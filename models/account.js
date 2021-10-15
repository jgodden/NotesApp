const { DateTime } = require("luxon");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AccountSchema = new Schema({
    name: { type: String },
    plan: { type: String }
  }
);

module.exports = mongoose.model('Account', AccountSchema);