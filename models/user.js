var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    _firstname: { type: String, required: true },
    _lastname: { type: String, required: true },
    _username: { type: String, required: true },
    _email: { type: String, required: true },
    _imageUrl: { type: String }
});

module.exports = mongoose.model('User', UserSchema);