const { DateTime } = require("luxon");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TopicSchema = new Schema({
    title: { type: String, required: true },
    item: { type: String, required: true },
    description: { type: String, required: false },
    subtopic: [{ type: Schema.ObjectId, ref: 'Subtopic' }]
});

module.exports = mongoose.model('Topic', TopicSchema);