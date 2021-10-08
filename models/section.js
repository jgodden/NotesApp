var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SectionSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true }
});

module.exports = mongoose.model('Section', SectionSchema);