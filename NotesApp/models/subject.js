var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SubjectSchema = new Schema({
    title: { type: String, required: true, maxLength: 50 },
});

// Virtual for subject's URL
SubjectSchema
.virtual('url')
.get(function () {
  return '/repo/subject/' + this._id;
});
module.exports = mongoose.model('Subject', SubjectSchema);