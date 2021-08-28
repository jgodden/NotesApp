const { body,validationResult } = require('express-validator');
var Note = require('../models/note');
var Subject = require('../models/subject');
var debug = require('debug')('note');

var async = require('async');

exports.index = function(req, res, next) {
    async.parallel({
        note_count: function(callback) { 
            Note.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        subject_count: function(callback) {
            Subject.countDocuments({}, callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'NoteApp Home', error: err, data: results });
    });
};

// Display list of all Notes.
exports.note_list = function(req, res, next) {

    Note.find({}, 'topic subject date')
      .populate('subject')
      .exec(function (err, list_notes) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('note_list', { topic: 'Note List', note_list: list_notes });
      });
  
  };

// Display detail page for a specific Note.
exports.note_detail = function(req, res, next) {
    async.parallel({
        note: function(callback) {

            Note.findById(req.params.id)
              .populate('subject')
              .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.note==null) { // No results.
            var err = new Error('Note not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('note_detail', { note: results.note } );
    });
};

// Display Note create form on GET.
exports.note_create_get = function(req, res, next) {
    // Get all subjects which we can use for adding to our note.
    async.parallel({
        subjects: function(callback) {
            Subject.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('note_form', { title: 'Create Note', subjects: results.subjects });
    });
};

// Handle Note create on POST.
exports.note_create_post = [
    // Validate and sanitise fields.
    body('topic', 'Topic must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('lectureNote', 'Lecture Note must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Note object with escaped and trimmed data.
        var note = new Note(
          { topic: req.body.topic,
            subject: req.body.subject,
            lectureNote: req.body.lectureNote,
            summary: req.body.summary,
           });
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all subjects for form.
            async.parallel({
                authors: function(callback) {
                    Subject.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('note_form', { title: 'Create Note',subjects:results.subjects, note: note, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save note.
            note.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new note record.
                   res.redirect(note.url);
                });
        }
    }
];

// Display Note delete form on GET.
exports.note_delete_get = function(req, res, next) {
    async.parallel({
        note: function(callback) {
            Note.findById(req.params.id).populate('subject').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.note==null) { // No results.
            res.redirect('/repo/notes');
        }
        console.log('GET Deleting note: ' + results.note);
        // Successful, so render.
        res.render('note_delete', { title: 'Delete Note', note: results.note } );
    });
};

// Handle Note delete on POST.
exports.note_delete_post = function(req, res, next) {
    async.parallel({
        note: function(callback) {
            Note.findById(req.body.noteid).populate('subject').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        // Delete object and redirect to the list of notes.
        Note.findByIdAndRemove(req.body.noteid, function deleteNote(err) {
            if (err) { return next(err); }
            // Success - got to notes list.
            res.redirect('/repo/notes');
        });
    });
};

// Display Note update form on GET.
exports.note_update_get = function(req, res, next) {
    // Get note and subjects for form.
    async.parallel({
        note: function(callback) {
            Note.findById(req.params.id).populate('subject').exec(callback);
        },
        subjects: function(callback) {
            Subject.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.note==null) { // No results.
                var err = new Error('Note not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('note_form', { title: 'Update Note', subjects:results.subjects, note: results.note });
        });
};

// Handle Note update on POST.
exports.note_update_post = [
    // Validate and santitize fields.
    body('topic', 'Topic must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('subject', 'Subject must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('date', 'Date must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('lectureNote', 'Lecture Note must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a Note object with escaped/trimmed data and old id.
        var note = new Note(
            { topic: req.body.topic,
            date: req.body.date,
            subject: req.body.subject,
            lectureNote: req.body.lectureNote,
            summary: req.body.summary,
            _id:req.params.id // This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all subjects for form
            async.parallel({
                aubjects: function(callback) {
                    Subject.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('note_form', { title: 'Update Note', subjects:results.subjects, note: note, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Note.findByIdAndUpdate(req.params.id, note, {}, function (err,thenote) {
                if (err) { return next(err); }
                    // Successful - redirect to note detail page.
                    res.redirect(thenote.url);
                });
        }
    }
];