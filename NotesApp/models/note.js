const { DateTime } = require("luxon");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var NoteSchema = new Schema({
    subject_id: { type: String, required: true },
    topic_id: { type: String, required: true },
    subtopic_id: { type: String, required: true },
    creationDate: { type: Date, required: true },
    updateDate: { type: Date, required: true },
    title: { type: String, required: true },
    lectureNote: { type: String, required: true },
    keywords: { type: String, required: false },
    questions: { type: String, required: false },
    comments: { type: String, required: false },
    summary: { type: String, required: true },
    image: { type: String, required: false }
});

// Virtual for note list URL
NoteSchema
.virtual('list_url')
.get(function () {
  return '/repo/' + this.subject_id + '/' + this.topic_id + '/' + this.subtopic_id + '/notes/';
});

// Virtual for update note URL
NoteSchema
.virtual('update_url')
.get(function () {
  return '/repo/' + this.subject_id + '/' + this.topic_id + '/' + this.subtopic_id + '/note/' + this._id;
});

NoteSchema
.virtual('creationDate_formatted')
.get(function () {
  return DateTime.fromJSDate(this.creationDate).toLocaleString(DateTime.DATE_MED);
});

NoteSchema
.virtual('updateDate_formatted')
.get(function () {
  return DateTime.fromJSDate(this.updateDate).toLocaleString(DateTime.DATE_MED);
});

NoteSchema
  .virtual('creationDate_yyyy_mm_dd')
  .get(function() {
    return DateTime.fromJSDate(this.creationDate).toISODate();
  });

NoteSchema
  .virtual('updateDate_yyyy_mm_dd')
  .get(function() {
    return DateTime.fromJSDate(this.updateDate).toISODate();
  });

module.exports = mongoose.model('Note', NoteSchema);