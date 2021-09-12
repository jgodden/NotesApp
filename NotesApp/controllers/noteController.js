const { body,validationResult } = require('express-validator');
var Note = require('../models/note');
var Subject = require('../models/subject');
var Topic = require('../models/topic');
var Subtopic = require('../models/subtopic');

var async = require('async');
const topic = require('../models/topic');
const note = require('../models/note');

exports.index = function(req, res, next) {
    res.render('index', {});
};

// decode all html encoding to original text
function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    }).replace(/&#x(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 16);
        return String.fromCharCode(num);
    }).replace(/&#x(\d+)\w;/gi, function(match, numStr) {
        var num = parseInt(numStr, 16);
        return String.fromCharCode(num);
    });
}

// Display list of all Notes.
exports.note_list = function(req, res, next) {
    var subjectid = req.params.subject;
    var topicid = req.params.topic;
    var subtopicid = req.params.subtopic;
    console.log('nl: subjectid ' + subjectid + ' topicid ' + topicid + ' subtopicid ' + subtopicid);
    async.series({
        // Get list of subject objects (three in array)
        subject_list: async function(callback) {
            // always get full list of subjects whether subjectid is a subject or
            // a <search all> indicator (1)
            subject_list = await Subject.find({}, 'title', callback);
            //console.log('nl: subject_list ' + subject_list);
        },
        // Get the subject objects that match subjectid (one in array)
        subject_object: async function(callback) {
            if (subjectid == 1) {
                // <search all> selected for subject
                //console.log('nl: search all subjects, so no subjectid');
                subject_object = null;
                return;
            }
            if (subjectid == 0) {
                // if coming from /, no subjectid set, so get first one in list
                subjectid = subject_list[0]._id;
                //console.log('nl: setting initial subjectid of ' + subjectid);
            }
            subject_object = await Subject.find({_id:subjectid}, 'title topic', callback);
            //console.log('nl: subject_object ' + subject_object[0]);
        },
        // Get list of topics for this subject
        topic_list: async function(callback) {
            if (subjectid == 1) {
                // <search all> selected for subject
                //console.log('nl: search all subjects, so empty topic_list');
                topic_list = [];
                return;
            }
            topic_list = await Topic.find({}, 'title subtopic').where('_id').in(subject_object[0].topic);
            //console.log('nl: topic_list ' + topic_list);
        },
        // Get list of topics for this subject
        topic_object: async function(callback) {
            if (topicid == 1) {
                // <search all> selected for topic
                //console.log('nl: search all topics, so no topicid');
                topic_object = null;
                return;
            }
            if (topicid == 0) {
                topicid = topic_list[0]._id;
                //console.log('nl: setting initial topicid of ' + topicid);
            }
            topic_object = await Topic.find({_id:topicid}, 'subtopic title');
            //console.log('nl: topic_object ' + topic_object[0]);
        },
        // Get list of subtopics for this topic
        subtopic_list: async function(callback) {
            if (topicid == 1) {
                // <search all> selected for topic
                //console.log('nl: search all topics, so empty subtopic_list');
                subtopic_list = [];
                return;
            }
            subtopic_list = await Subtopic.find({}, 'title').where('_id').in(topic_object[0].subtopic);
            //console.log('nl: subtopic_list ' + subtopic_list);
        },
        subtopic_object: async function(callback) {
            if (subtopicid == 1) {
                // <search all> selected for subtopic
                //console.log('nl: search all subtopics, so no subtopicid');
                subtopic_object = null;
                return;
            }
            if (subtopicid == 0) {
                subtopicid = subtopic_list[0]._id;
                //console.log('nl: setting initial subtopicid of ' + subtopicid);
            }
            subtopic_object = await Subtopic.find({_id:subtopicid}, 'title description');
            //console.log('nl: subtopic_object ' + subtopic_object[0]);
        },
        // Get list of notes for this subject, topic and subtopic. Retrieve title and dates for list and ids for urls.
        note_list: async function (callback) {
            if (subtopicid == 1) {
                if (topicid == 1) {
                    if (subjectid == 1) {
                        //console.log('nl: subject, topic and subtopic <search all>');
                        note_list = await Note.find({}, 'title subject_id topic_id subtopic_id creationDate updateDate', callback);
                    } else {
                        //console.log('nl: topic and subtopic <search all>');
                        note_list = await Note.find({subject_id:subjectid}, 'title subject_id topic_id subtopic_id creationDate updateDate', callback);
                    }
                } else {
                    //console.log('nl: subtopic <search all> ' + subjectid + ':' + topicid);
                    note_list = await Note.find({subject_id:subjectid, topic_id:topicid}, 'title subject_id topic_id subtopic_id creationDate updateDate', callback);
                }
            } else {
                //console.log('nl: no <search all>');
                note_list = await Note.find({subject_id:subjectid, topic_id:topicid, subtopic_id:subtopicid}, 'title subject_id topic_id subtopic_id creationDate updateDate', callback);
            }
            //console.log('nl: note_list ' + note_list);
        },
        // Get number of notes with matching subjectid
        note_count: async function(callback) {
            if (subtopicid == 1) {
                if (topicid == 1) {
                    if (subjectid == 1) {
                        note_count = await Note.countDocuments({}).exec(callback);
                    } else {
                        note_count = await Note.countDocuments({subject_id:subjectid}).exec(callback);
                    }
                } else {
                    note_count = await Note.countDocuments({subject_id:subjectid, topic_id:topicid}).exec(callback);
                }
            } else {
                note_count = await Note.countDocuments({subject_id:subjectid, topic_id:topicid, subtopic_id:subtopicid}).exec(callback);
            }
            console.log('nl: note_count ' + note_count);
        },
    }, function(err, results) {
        if (err) {
            console.error('nl: Error processing note list: ' + err);
            return next(err);
        }

        note_list.forEach(function (item, index) {
            item.title = decodeEntities(item.title);
        });
        var subject_name = null;
        if (subject_object !== null) {
            subject_name = subject_object[0].title;
        }
        var topic_name = null;
        if (topic_object !== null) {
            topic_name = topic_object[0].title;
        }
        var subtopic_name = null;
        var subtopic_description = null;
        if (subtopic_object !== null) {
            subtopic_name = subtopic_object[0].title;
            subtopic_description = subtopic_object[0].description;
        }
        res.render('note_list', {
            title: 'List',
            note_count: note_count,
            note_list: note_list,
            subject_list: subject_list,
            topic_list: topic_list,
            subjectid: subjectid,
            topicid: topicid,
            subtopicid: subtopicid,
            subtopic_list: subtopic_list,
            subject_name: subject_name,
            topic_name: topic_name,
            subtopic_name: subtopic_name,
            subtopic_description: subtopic_description
        } );
    });
};

// Display Note create form on GET.
exports.note_create_get = function(req, res, next) {
    var subjectid = req.params.subject;
    var topicid = req.params.topic;
    var subtopicid = req.params.subtopic;
    //console.log('create subjectid ' + subjectid + ' topicid ' + topicid + ' subtopicid ' + subtopicid);
    async.series({
        // Get list of subject objects (three in array)
        subject_list: async function(callback) {
            subject_list = await Subject.find({}, 'title', callback);
            //console.log('create subject_list ' + subject_list);
        },
        // Get the subject objects that match subjectid (one in array)
        subject_object: async function(callback) {
            // if coming from /, no subjectid set, so get first one in list
            if (subjectid) {
                if (subjectid == 0) {
                  subjectid = subject_list[0]._id;
                  //console.log('create setting initial subjectid of ' + subjectid);
                }
            } else {
                subjectid = subject_list[0]._id;
            }
            subject_object = await Subject.find({_id:subjectid}, 'title topic', callback);
            //console.log('create subject_object ' + subject_object[0]);
        },
        // Get list of topics for this subject
        topic_list: async function(callback) {
            topic_list = await Topic.find({}, 'title subtopic').where('_id').in(subject_object[0].topic);
            //console.log('create topic_list ' + topic_list);
        },
        // Get list of topics for this subject
        topic_object: async function(callback) {
            if (topicid) {
                if (topicid == 0) {
                    topicid = subject_object[0].topic[0];
                    //console.log('create setting initial topicid of ' + topicid);
                }
            }
            topic_object = await Topic.find({_id:topicid}, 'subtopic title');
            //console.log('create topic_object ' + topic_object[0]);
        },
        // Get list of subtopics for this topic
        subtopic_list: async function(callback) {
            subtopic_list = await Subtopic.find({}, 'title').where('_id').in(topic_object[0].subtopic);
            //console.log('create subtopic_list ' + subtopic_list);
        },
        subtopic_object: async function(callback) {
            if (subtopicid) {
                if (subtopicid == 0) {
                    subtopicid = topic_object[0].subtopic[0];
                    //console.log('create setting initial subtopicid of ' + subtopicid);
                }
            }
            subtopic_object = await Subtopic.find({_id:subtopicid}, 'title');
            //console.log('create subtopic_object ' + subtopic_object[0]);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Need to clear note otherwise it is persisted after viewing another note
        res.locals.note = '';
        res.render('note_form', {
            title: 'Create',
            subject_list: subject_list,
            topic_list: topic_list,
            subjectid: subjectid,
            topicid: topicid,
            subtopicid: subtopicid,
            subtopic_list: subtopic_list,
            subject_name: subject_object[0].title,
            topic_name: topic_object[0].title,
            subtopic_name: subtopic_object[0].title,
        });
    });
};

// Handle Note create on POST.
exports.note_create_post = [
    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('lectureNote', 'Lecture Note must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        var image_url = req.body.imageUrl;
        var image_err = 0;
        var tags = req.body.keywords.split(" ");

        require('dotenv').config();
        const cloudinary = require('cloudinary').v2;
        var uploadResponse = '';
        (async () => {
            var uploadResponse = '';
            // Save the canvas image to cloud
            await cloudinary.uploader.upload(req.body.imageData,
            {
                overwrite: true,
                invalidate: true,
                folder: req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid,
                tags: tags,
                public_id: req.params.note
            })
            .then(uploadResult => uploadResponse = uploadResult)
            .catch(error => image_err = 1);
            image_url = uploadResponse.url;

            // Extract the validation errors from a request.
            const errors = await validationResult(req);
            var now = Date.now();
            // Create a Note object with escaped and trimmed data.
            var note = new Note({
                title: req.body.title,
                lectureNote: req.body.lectureNote,
                creationDate: now,
                updateDate: now,
                keywords: req.body.keywords,
                questions: req.body.questions,
                comments: req.body.comments,
                summary: req.body.summary,
                subject_id: req.body.subjectid,
                topic_id: req.body.topicid,
                subtopic_id: req.body.subtopicid,
                image: image_url
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
                    if (err) {
                        return next(err);
                    }
                    //successful - redirect to new note record.
                    res.redirect(note.list_url);
                });
            }
        })();
    }
];

// Display Note delete form on GET.
exports.note_delete_get = function(req, res, next) {
    var subjectid = req.params.subject;
    var topicid = req.params.topic;
    var subtopicid = req.params.subtopic;
    //console.log('delete subjectid ' + subjectid + ' topicid ' + topicid + ' subtopicid ' + subtopicid);
    async.series({
        // Get list of subject objects (three in array)
        subject_list: async function(callback) {
            // always get full list of subjects whether subjectid is a subject or
            // a <search all> indicator (1)
            subject_list = await Subject.find({}, 'title', callback);
            //console.log('nd: subject_list ' + subject_list);
        },
        // Get the subject objects that match subjectid (one in array)
        subject_object: async function(callback) {
            if (subjectid == 1) {
                // <search all> selected for subject
                //console.log('nd: search all subjects, so no subjectid');
                subject_object = null;
                return;
            }
            if (subjectid == 0) {
                // if coming from /, no subjectid set, so get first one in list
                subjectid = subject_list[0]._id;
                //console.log('nd: setting initial subjectid of ' + subjectid);
            }
            subject_object = await Subject.find({_id:subjectid}, 'title topic', callback);
            //console.log('nd: subject_object ' + subject_object[0]);
        },
        // Get list of topics for this subject
        topic_list: async function(callback) {
            if (subjectid == 1) {
                // <search all> selected for subject
                //console.log('nd: search all subjects, so empty topic_list');
                topic_list = [];
                return;
            }
            topic_list = await Topic.find({}, 'title subtopic').where('_id').in(subject_object[0].topic);
            //console.log('nd: topic_list ' + topic_list);
        },
        // Get list of topics for this subject
        topic_object: async function(callback) {
            if (topicid == 1) {
                // <search all> selected for topic
                //console.log('nd: search all topics, so no topicid');
                topic_object = null;
                return;
            }
            if (topicid == 0) {
                topicid = topic_list[0]._id;
                //console.log('nd: setting initial topicid of ' + topicid);
            }
            topic_object = await Topic.find({_id:topicid}, 'subtopic title');
            //console.log('nd: topic_object ' + topic_object[0]);
        },
        // Get list of subtopics for this topic
        subtopic_list: async function(callback) {
            if (topicid == 1) {
                // <search all> selected for topic
                //console.log('nd: search all topics, so empty subtopic_list');
                subtopic_list = [];
                return;
            }
            subtopic_list = await Subtopic.find({}, 'title').where('_id').in(topic_object[0].subtopic);
            //console.log('nd: subtopic_list ' + subtopic_list);
        },
        subtopic_object: async function(callback) {
            if (subtopicid == 1) {
                // <search all> selected for subtopic
                //console.log('nd: search all subtopics, so no subtopicid');
                subtopic_object = null;
                return;
            }
            if (subtopicid == 0) {
                subtopicid = subtopic_list[0]._id;
                //console.log('nd: setting initial subtopicid of ' + subtopicid);
            }
            subtopic_object = await Subtopic.find({_id:subtopicid}, 'title description');
            //console.log('nd: subtopic_object ' + subtopic_object[0]);
        },
        // Get list of notes for this subject, topic and subtopic. Retrieve title and dates for list and ids for urls.
        note_object: async function (callback) {
            note_object = await Note.find({subject_id:subjectid, topic_id:topicid, subtopic_id:subtopicid}, 'title subject_id topic_id subtopic_id creationDate updateDate', callback);
            //console.log('nd: note_list ' + note_list);
        },
    }, function(err, results) {
        if (err) {
            console.error('nd: Error processing note list: ' + err);
            return next(err);
        }

        note_object.forEach(function (item, index) {
            item.title = decodeEntities(item.title);
        });
        var subject_name = null;
        if (subject_object !== null) {
            subject_name = subject_object[0].title;
        }
        var topic_name = null;
        if (topic_object !== null) {
            topic_name = topic_object[0].title;
        }
        var subtopic_name = null;
        var subtopic_description = null;
        if (subtopic_object !== null) {
            subtopic_name = subtopic_object[0].title;
            subtopic_description = subtopic_object[0].description;
        }

        res.render('note_delete', {
            title: 'Delete',
            note: note_object[0],
            subject_list: subject_list,
            topic_list: topic_list,
            subjectid: subjectid,
            topicid: topicid,
            subtopicid: subtopicid,
            subtopic_list: subtopic_list,
            subject_name: subject_name,
            topic_name: topic_name,
            subtopic_name: subtopic_name
        } );
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
            res.redirect('/repo/' + req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid + '/notes');
        });
    });
};

// Display Note update form on GET.
exports.note_update_get = function(req, res, next) {
    var subjectid = req.params.subject;
    var topicid = req.params.topic;
    var subtopicid = req.params.subtopic;
    var noteid = req.params.note;
    //console.log('update subjectid ' + subjectid + ' topicid ' + topicid + ' subtopicid ' + subtopicid + ' noteid ' + noteid);

    async.series({
        // Get the note to be updated
        note_object: async function(callback) {
            note_object = await Note.findById(noteid).exec(callback);
            //console.log('update note ' + note_object);
        },
        // Get list of subject objects (three in array)
        subject_list: async function(callback) {
            subject_list = await Subject.find({}, 'title', callback);
            //console.log('note_list subject_list ' + subject_list);
        },
        // Get the subject objects that match subjectid (one in array)
        subject_object: async function(callback) {
            // if coming from /, no subjectid set, so get first one in list
            if (subjectid) {
                if (subjectid == 0) {
                  subjectid = subject_list[0]._id;
                  //console.log('update setting initial subjectid of ' + subjectid);
                }
            } else {
                subjectid = subject_list[0]._id;
            }
            subject_object = await Subject.find({_id:subjectid}, 'title topic', callback);
            //console.log('note_list subject_object ' + subject_object[0]);
        },
        // Get list of topics for this subject
        topic_list: async function(callback) {
            topic_list = await Topic.find({}, 'title subtopic').where('_id').in(subject_object[0].topic);
            //console.log('update topic_list ' + topic_list);
        },
        // Get list of topics for this subject
        topic_object: async function(callback) {
            if (topicid) {
                if (topicid == 0) {
                    topicid = subject_object[0].topic[0];
                    //console.log('update setting initial topicid of ' + topicid);
                }
            }
            topic_object = await Topic.find({_id:topicid}, 'subtopic title');
            //console.log('update topic_object ' + topic_object[0]);
        },
        // Get list of subtopics for this topic
        subtopic_list: async function(callback) {
            subtopic_list = await Subtopic.find({}, 'title').where('_id').in(topic_object[0].subtopic);
            //console.log('update subtopic_list ' + subtopic_list);
        },
        subtopic_object: async function(callback) {
            if (subtopicid) {
                if (subtopicid == 0) {
                    subtopicid = topic_object[0].subtopic[0];
                    //console.log('update setting initial subtopicid of ' + subtopicid);
                }
            }
            subtopic_object = await Subtopic.find({_id:subtopicid}, 'title');
            //console.log('update subtopic_object ' + subtopic_object[0]);
        },
        // Get list of notes whose subject object id is subjectid
        note_list: async function (callback) {
            note_list = await Note.find({subject_id:subjectid, topic_id:topicid, subtopic_id:subtopicid}, callback);
            //console.log('update ' + note_list);
        },
        // Get number of notes with matching subjectid
        note_count: async function(callback) {
            note_count = await Note.countDocuments({subject_id:subjectid, topic_id:topicid, subtopic_id:subtopicid})
            .exec(callback);
            //console.log('update ' + note_count);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success.
        // decode text for form inputs to translate any special chars
        note_object.title = decodeEntities(note_object.title);
        note_object.lectureNote = decodeEntities(note_object.lectureNote);
        note_object.keywords = decodeEntities(note_object.keywords);
        note_object.questions = decodeEntities(note_object.questions);
        note_object.comments = decodeEntities(note_object.comments);
        note_object.summary = decodeEntities(note_object.summary);
        res.render('note_form', {
            title: 'Update',
            note: note_object,
            subject_list: subject_list,
            topic_list: topic_list,
            subjectid: subjectid,
            topicid: topicid,
            subtopicid: subtopicid,
            subtopic_list: subtopic_list,
            subject_name: subject_object[0].title,
            topic_name: topic_object[0].title,
            subtopic_name: subtopic_object[0].title
        });
    });
};

// Handle Note update on POST.
exports.note_update_post = [
    // Validate and santitize fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('lectureNote', 'Lecture Note must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        var image_url = req.body.imageUrl;
        var image_err = 0;
        var tags = req.body.keywords.split(" ");

        require('dotenv').config();
        const cloudinary = require('cloudinary').v2;
        var uploadResponse = '';
        (async () => {
            var uploadResponse = '';
            // Save the canvas image to cloud
            await cloudinary.uploader.upload(req.body.imageData,
            {
                overwrite: true,
                invalidate: true,
                folder: req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid,
                tags: tags,
                public_id: req.params.note
            })
            .then(uploadResult => uploadResponse = uploadResult)
            .catch(error => image_err = 1);
            image_url = uploadResponse.url;

            // Extract the validation errors from a request.
            const errors = await validationResult(req);
            var now = Date.now();
            // Create a Note object with escaped/trimmed data and old id.
            var note = await new Note({
                title: req.body.title,
                lectureNote: req.body.lectureNote,
                creationDate: req.body.creationDate,
                updateDate: now,
                keywords: req.body.keywords,
                questions: req.body.questions,
                comments: req.body.comments,
                summary: req.body.summary,
                subject_id: req.body.subjectid,
                topic_id: req.body.topicid,
                subtopic_id: req.body.subtopicid,
                image: image_url,   // use the cloud url instead of the image data
                _id:req.params.note // This is required, or a new ID will be assigned!
            });

            if (!errors.isEmpty() || (image_err == 1)) {
                // There are errors. Render form again with sanitized values/error messages.
                res.render('note_form', { note: note });
                return;
            }
            else {
                // Data from form is valid so update the record
                Note.findByIdAndUpdate(req.params.note, note, {}, function (err,thenote) {
                    if (err) {
                        return next(err);
                    }
                    // Successful - redirect to note list page.
                    res.redirect(thenote.list_url);
                });
            }
        })();
    }
];
