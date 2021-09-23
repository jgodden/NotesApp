const { DateTime } = require("luxon");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubtopicSchema = new Schema({
    title: { type: String, required: true },
    item: { type: String, required: true },
    description: { type: String, required: true },
    section: [{ type: Schema.ObjectId, ref: 'Section' }]
});

module.exports = mongoose.model('Subtopic', SubtopicSchema);