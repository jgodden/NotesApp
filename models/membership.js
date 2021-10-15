const { DateTime } = require("luxon");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MembershipSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    account: { type: Schema.ObjectId, ref: 'Account' },
    role: { type: String },
    accountemail: { type: String },
    accountphone: { type: String }
  }
);

module.exports = mongoose.model('Membership', MembershipSchema);