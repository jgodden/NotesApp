const { DateTime } = require("luxon");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var NoteSchema = new Schema({
    subject: { type: Schema.ObjectId, ref: 'Subject' },
    topic: { type: Schema.ObjectId, ref: 'Topic' },
    subtopic: {  type: Schema.ObjectId, ref: 'Subtopic'  },
    user: {  type: Schema.ObjectId, ref: 'User'  },
    creationDate: { type: Date, required: true },
    updateDate: { type: Date, required: true },
    title: { type: String, required: true },
    lectureNote: { type: String, required: false },
    keywords: { type: String, required: false },
    questions: { type: String, required: false },
    comments: { type: String, required: false },
    summary: { type: String, required: false },
    image: { type: String, required: false }
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true } }  // make virtuals available on client side
);

// Virtual for note list URL
NoteSchema
.virtual('list_url')
.get(function () {
  return '/' + this.subject._id + '/' + this.topic._id + '/' + this.subtopic._id + '/notes/';
});

// Virtual for update note URL
NoteSchema
.virtual('update_url')
.get(function () {
  return '/' + this.subject._id + '/' + this.topic._id + '/' + this.subtopic._id + '/note/' + this._id;
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