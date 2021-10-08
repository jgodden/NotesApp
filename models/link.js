var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LinkSchema = new Schema({
    title: { type: String, required: true },
    href: { type: String, required: true },
    category: { type: String, required: true }
});

module.exports = mongoose.model('Link', LinkSchema);