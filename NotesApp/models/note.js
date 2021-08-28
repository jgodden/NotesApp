const { DateTime } = require("luxon");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var NoteSchema = new Schema({
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    date: { type: Date, default: Date.now, required: true },
    topic: { type: String, required: true },
    lectureNote: { type: String, required: true },
    keywords: [{ type: String, required: false }],
    questions: [{ type: String, required: false }],
    comments: [{ type: String, required: false }],
    summary: { type: String, required: true }
});

// Virtual for note's URL
NoteSchema
.virtual('url')
.get(function () {
  return '/repo/note/' + this._id;
});

NoteSchema
.virtual('date_formatted')
.get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

NoteSchema
  .virtual('date_yyyy_mm_dd')
  .get(function() {
    return DateTime.fromJSDate(this.date).toISODate();
  });

module.exports = mongoose.model('Note', NoteSchema);