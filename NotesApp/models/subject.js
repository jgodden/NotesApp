const { DateTime } = require("luxon");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubjectSchema = new Schema({
    title: { type: String, required: true },
    topic: [{ type: Schema.ObjectId, ref: 'Topic' }]
});

module.exports = mongoose.model('Subject', SubjectSchema);
