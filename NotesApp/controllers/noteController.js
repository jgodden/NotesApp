const { body,validationResult } = require('express-validator');
var Note = require('../models/note');
var Subject = require('../models/subject');
var debug = require('debug')('note');

var async = require('async');

exports.index = function(req, res, next) {
    async.parallel({
        subject_list: function(callback) {
            Subject.find({}, callback);
        },
    }, function(err, results) {
        console.log('in index: ' + req.params.subject);
        res.render('index', { data: results });
    });
};

// Display list of all Notes.
exports.note_list = function(req, res, next) {
    var subject_id = req.params.subject;
    async.parallel({
        note_count: function(callback) {
            Note.countDocuments({subject:subject_id})
            .exec(callback);
        },
        note_list: function (callback) {
          Note.find({subject:subject_id}, 'topic date', callback);
        },
        subject: function (callback) {
            Subject.find({_id:subject_id}, callback);
        },
        subject_list: function (callback) {
          Subject.find({}, callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        console.log('note_count: ' + results.note_count);
        console.log('subject_id: ' + subject_id);
        console.log('subject: ' + results.subject[0].title);
        res.render('note_list', {
            title: 'List',
            note_count: results.note_count,
            note_list: results.note_list,
            subject_list: results.subject_list,
            subject_id: subject_id,
            subject: results.subject[0].title
        } );
    });
};

// Display detail page for a specific Note.
exports.note_detail = function(req, res, next) {
    var subject_id = req.params.subject;
    async.parallel({
        note: function(callback) {
            Note.findById(req.params.note)
              .exec(callback);
        },
        note_count: function(callback) {
            Note.countDocuments({subject:subject_id})
            .exec(callback);
        },
        note_list: function (callback) {
          Note.find({subject:subject_id}, 'topic date', callback);
        },
        subject: function (callback) {
            Subject.find({_id:subject_id}, callback);
        },
        subject_list: function (callback) {
          Subject.find({}, callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.note==null) { // No results.
            var err = new Error('Note not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('note_detail', {
            title: 'Detail',
            note: results.note,
            note_count: results.note_count,
            note_list: results.note_list,
            subject_list: results.subject_list,
            subject_id: subject_id,
            subject: results.subject[0].title
        } );
    });
};

// Display Note create form on GET.
exports.note_create_get = function(req, res, next) {
    var subject_id = req.params.subject;
    async.parallel({
        note_count: function(callback) {
            Note.countDocuments({subject:subject_id})
            .exec(callback);
        },
        note_list: function (callback) {
          Note.find({subject:subject_id}, 'topic date', callback);
        },
        subject: function (callback) {
            Subject.find({_id:subject_id}, callback);
        },
        subject_list: function (callback) {
          Subject.find({}, callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('note_create', {
            title: 'Create',
            note_count: results.note_count,
            note_list: results.note_list,
            subject_list: results.subject_list,
            subject_id: subject_id,
            subject: results.subject[0].title
        });
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
                subject_list: function(callback) {
                    Subject.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('note_create', { data: results });
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
    var subject_id = req.params.subject;
    async.parallel({
        note: function(callback) {
            Note.findById(req.params.note).exec(callback);
        },
        note_count: function(callback) {
            Note.countDocuments({subject:subject_id})
            .exec(callback);
        },
        note_list: function (callback) {
          Note.find({subject:subject_id}, 'topic date', callback);
        },
        subject: function (callback) {
            Subject.find({_id:subject_id}, callback);
        },
        subject_list: function (callback) {
          Subject.find({}, callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.note==null) { // No results.
            res.redirect('/repo/notes');
        }
        // Successful, so render.
       res.render('note_delete', {
           title: 'Delete', note: results.note,
           note_count: results.note_count,
           note_list: results.note_list,
           subject_list: results.subject_list,
           subject_id: subject_id,
           subject: results.subject[0].title
        });
    });
};

// Handle Note delete on POST.
exports.note_delete_post = function(req, res, next) {
    async.parallel({
        note: function(callback) {
            Note.findById(req.body.note).populate('subject').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        // Delete object and redirect to the list of notes.
        Note.findByIdAndRemove(req.body.noteid, function deleteNote(err) {
            if (err) { return next(err); }
            // Success - got to notes list.
            res.redirect('/repo/:subject/notes');
        });
    });
};

// Display Note update form on GET.
exports.note_update_get = function(req, res, next) {
    var subject_id = req.params.subject;
    // Get note and subjects for form.
    async.parallel({
        note: function(callback) {
            Note.findById(req.params.note).populate('subject').exec(callback);
        },
        note_count: function(callback) {
            Note.countDocuments({subject:subject_id})
            .exec(callback);
        },
        note_list: function (callback) {
          Note.find({subject:subject_id}, 'topic date', callback);
        },
        subject: function (callback) {
            Subject.find({_id:subject_id}, callback);
        },
        subject_list: function (callback) {
          Subject.find({}, callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.note==null) { // No results.
            var err = new Error('Note not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('note_form', {
            title: 'Delete', note: results.note,
            note_count: results.note_count,
            note_list: results.note_list,
            subject_list: results.subject_list,
            subject_id: subject_id,
            subject: results.subject[0].title
        });
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
            _id:req.params.note // This is required, or a new ID will be assigned!
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
                res.render('note_form', { data: results });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Note.findByIdAndUpdate(req.params.note, note, {}, function (err,thenote) {
                if (err) { return next(err); }
                    // Successful - redirect to note detail page.
                    res.redirect(thenote.url);
                });
        }
    }
];
