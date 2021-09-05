const { body,validationResult } = require('express-validator');
var Note = require('../models/note');

var async = require('async');

exports.index = function(req, res, next) {
    res.render('index', {});
};

// Display list of all Notes.
exports.note_list = function(req, res, next) {
    var subject = req.params.subject;
    async.parallel({
        note_count: function(callback) {
            Note.countDocuments({subject:subject})
            .exec(callback);
        },
        note_list: function (callback) {
          Note.find({subject:subject}, 'topic creationDate updateDate subject', callback);
        },
      }, function(err, results) {
        if (err) { return next(err); }
        res.render('note_list', {
            title: 'List',
            note_count: results.note_count,
            note_list: results.note_list,
            subject: subject,
            subject_list: subject_list
        } );
    });
};

// Display Note create form on GET.
exports.note_create_get = function(req, res, next) {
    var subject = req.params.subject;
    async.parallel({
        note_count: function(callback) {
            Note.countDocuments({subject:subject})
            .exec(callback);
        },
        note_list: function (callback) {
          Note.find({subject:subject}, 'topic date', callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        
        res.render('note_form', {
            title: 'Create',
            note_count: results.note_count,
            note_list: results.note_list,
            subject: subject
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

        var date = Date.now();
        // Create a Note object with escaped and trimmed data.
        var note = new Note({
            topic: req.body.topic,
            lectureNote: req.body.lectureNote,
            creationDate: date,
            updateDate: date,
            keywords: req.body.keywords,
            questions: req.body.questions,
            comments: req.body.comments,
            summary: req.body.summary,
            subject: req.body.subject,
            image: req.body.image
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('note_form', {
                title: 'Create',
                subject: subject
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
    var subject = req.params.subject;
    async.parallel({
        note: function(callback) {
            Note.findById(req.params.note).exec(callback);
        },
        note_count: function(callback) {
            Note.countDocuments({subject:subject})
            .exec(callback);
        },
        note_list: function (callback) {
          Note.find({subject:subject}, 'topic date', callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.note==null) { // No results.
            res.redirect('/repo/notes');
        }
        // Successful, so render.
       res.render('note_delete', {
           title: 'Delete',
           note: results.note,
           note_count: results.note_count,
           note_list: results.note_list,
           subject: subject
        });
    });
};

// Handle Note delete on POST.
exports.note_delete_post = function(req, res, next) {
    async.parallel({
        note: function(callback) {
            Note.findById(req.body.note).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        // Delete object and redirect to the list of notes.
        Note.findByIdAndRemove(req.body.noteid, function deleteNote(err) {
            if (err) { return next(err); }
            // Success - got to notes list.
            res.redirect('/repo/' + req.body.subject + '/notes');
        });
    });
};

// Display Note update form on GET.
exports.note_update_get = function(req, res, next) {
    var subject = req.params.subject;
    // Get note and subjects for form.
    async.parallel({
        note: function(callback) {
            Note.findById(req.params.note).exec(callback);
        },
        note_count: function(callback) {
            Note.countDocuments({subject:subject})
            .exec(callback);
        },
        note_list: function (callback) {
          Note.find({subject:subject}, 'topic date image', callback);
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
            title: 'Update',
            note: results.note,
            note_count: results.note_count,
            note_list: results.note_list,
            subject: subject
        });
    });
};

// Handle Note update on POST.
exports.note_update_post = [
    // Validate and santitize fields.
    body('topic', 'Topic must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('lectureNote', 'Lecture Note must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        console.log('update validation');
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a Note object with escaped/trimmed data and old id.
        var date = Date.now();
        var note = new Note({
            topic: req.body.topic,
            lectureNote: req.body.lectureNote,
            creationDate: req.body.date,
            updateDate: date,
            keywords: req.body.keywords,
            questions: req.body.questions,
            comments: req.body.comments,
            summary: req.body.summary,
            subject: req.body.subject,
            image: req.body.image,
            _id:req.params.note // This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('note_form', { data: results });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Note.findByIdAndUpdate(req.params.note, note, {}, function (err,thenote) {
                if (err) { return next(err); }
                    // Successful - redirect to note list page.
                    res.redirect('/repo/' + thenote.subject + '/notes');
                });
        }
    }
];
