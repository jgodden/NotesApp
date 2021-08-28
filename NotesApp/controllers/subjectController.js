const { body,validationResult } = require('express-validator');
var Subject = require('../models/subject');
var Note = require('../models/note')
var async = require('async');

// Display list of all Subjects.
exports.subject_list = function(req, res, next) {

    Subject.find()
      .sort([['subject', 'ascending']])
      .exec(function (err, list_subjects) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('subject_list', { title: 'Subject List', subject_list: list_subjects });
      });
  
  };

// Display detail page for a specific Subject.
exports.subject_detail = function(req, res, next) {
    async.parallel({
        subject: function(callback) {
            Subject.findById(req.params.id)
              .exec(callback);
        },
        subjects_notes: function (callback) {
            Note.find({ 'subject': req.params.id }, 'topic summary')
                .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.subject==null) { // No results.
            var err = new Error('Subject not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('subject_detail', { title: results.subject.title, subject: results.subject, subject_notes: results.subjects_notes } );
    });
};

// Display Subject create form on GET.
exports.subject_create_get = function(req, res, next) {
    res.render('subject_form', { title: 'Create Subject'});
};

// Handle Subject create on POST.
exports.subject_create_post = [

    // Validate and sanitize fields.
    body('title').trim().isLength({ min: 1 }).escape().withMessage('Subject must be specified.')
        .isAlphanumeric().withMessage('Subject has non-alphanumeric characters.'),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        console.log("req.body.title: " + req.body.title);

        // Create a Subject object with escaped and trimmed data.
        var subject = new Subject(
            {
                title: req.body.title
            });
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('subject_form', { title: 'Create Subject', subject: req.body, errors: errors.array() });
            return;
        }
        else {
            Subject.findOne({ 'title': req.body.title })
            .exec( function(err, found_subject) {
               if (err) { return next(err); }
    
               if (found_subject) {
                 // Subject exists, redirect to its detail page.
                 res.redirect(found_subject.url);
                }
                else {
                    // Data from form is valid.
                    subject.save(function (err) {
                        if (err) { return next(err); }
                        // Successful - redirect to new subject record.
                        res.redirect(subject.url);
                    });
                }
            });
        }
    }
];

// Display Subject delete form on GET.
exports.subject_delete_get = function(req, res, next) {
    async.parallel({
        subject: function(callback) {
            Subject.findById(req.params.id).exec(callback)
        },
        subjects_notes: function(callback) {
          Note.find({ 'subject': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.subject==null) { // No results.
            res.redirect('/repo/subjects');
        }
        // Successful, so render.
        res.render('subject_delete', { title: 'Delete Subject', subject: results.subject, subject_notes: results.subjects_notes } );
    });
};

// Handle Subject delete on POST.
exports.subject_delete_post = function(req, res, next) {
    async.parallel({
        subject: function(callback) {
          Subject.findById(req.body.subjectid).exec(callback)
        },
        subjects_notes: function(callback) {
          Note.find({ 'subject': req.body.subjectid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.subjects_notes.length > 0) {
            // Subject has notes. Render in same way as for GET route.
            res.render('subject_delete', { title: 'Delete Subject', subject: results.subject, subject_notes: results.subjects_notes } );
            return;
        }
        else {
            // Subject has no notes. Delete object and redirect to the list of subjects.
            Subject.findByIdAndRemove(req.body.subjectid, function deleteSubject(err) {
                if (err) { return next(err); }
                // Success - go to subject list
                res.redirect('/repo/subjects')
            })
        }
    });
};

// Display Subject update form on GET.
exports.subject_update_get = function(req, res, next) {
    Subject.findById(req.params.id, function (err, subject) {
        if (err) { return next(err); }
        if (subject == null) { // No results.
            var err = new Error('Subject not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('subject_form', { title: 'Update Subject', subject: subject });

    });
};

// Handle Subject update on POST.
exports.subject_update_post = [

    // Validate and santize fields.
    body('title').trim().isLength({ min: 1 }).escape().withMessage('Title must be specified.')
        .isAlphanumeric().withMessage('Title has non-alphanumeric characters.'),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Subject object with escaped and trimmed data (and the old id!)
        var subject = new Subject(
            {
                title: req.body.title,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('subject_form', { title: 'Update Subject', subject: subject, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Subject.findByIdAndUpdate(req.params.id, subject, {}, function (err, thesubject) {
                if (err) { return next(err); }
                // Successful - redirect to subject detail page.
                res.redirect(thesubject.url);
            });
        }
    }
];