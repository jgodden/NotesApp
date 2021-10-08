var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubjectSchema = new Schema({
    title: { type: String, required: true },
    topic: [{ type: Schema.ObjectId, ref: 'Topic' }],
    link: [{ type: Schema.ObjectId, ref: 'Link' }]
});

module.exports = mongoose.model('Subject', SubjectSchema);
