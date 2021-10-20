const { DateTime } = require("luxon");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MembershipSchema = new Schema({
    _user: { type: Schema.ObjectId, ref: 'User' },
    _account: { type: Schema.ObjectId, ref: 'Account' },
    _role: { type: String },
    _accountemail: { type: String },
    _accountphone: { type: String }
  }
);

module.exports = mongoose.model('Membership', MembershipSchema);