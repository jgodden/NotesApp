const { body, validationResult } = require('express-validator');
const Note = require('../models/note');
const Subject = require('../models/subject');
const Topic = require('../models/topic');
const Subtopic = require('../models/subtopic');

const async = require('async');

exports.home_page = function(req, res, next) {
    //console.log('redirect from ' + req.url + ' to /0/0/0');
    res.redirect('/1/1/1');
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
    }).replace(/&#x(\d+\w);/gi, function(match, numStr) {
        var num = parseInt(numStr, 16);
        return String.fromCharCode(num);
    });
}

// Generate SHA256 hash of security info for Media Library access
function getSHA256Hash() {
    var cloud_name = 'ddpa7qntq';
    var api_secret = '9WTx-0O2jnv2hvn5zglC7RrGlYk';
    var username = 'jgodden@hotmail.com';
    var unixTimestamp = Math.floor(Date.now() / 1000);
    var sig = "cloud_name=" + cloud_name + '&timestamp=' + unixTimestamp + '&username=' + username + api_secret;
    return(require('js-sha256')(sig));
}

var dbgNoteList = require('debug')('noteList');

// display note list page on GET.
exports.note_list = function(req, res, next) {
    var subjectid = req.params.subject;
    var topicid = req.params.topic;
    var subtopicid = req.params.subtopic;
    dbgNoteList('subjectid ' + subjectid + ' topicid ' + topicid + ' subtopicid ' + subtopicid);
    async.series({
        // Get list of subject objects (three in array)
        subject_list: async function(callback) {
            // always get full list of subjects whether subjectid is a subject or
            // a <search all> indicator (1)
            subject_list = await Subject.find({}, 'title', callback);
            dbgNoteList('subject_list ' + subject_list);
        },
        // Get the subject objects that match subjectid (one in array)
        subject_object: async function(callback) {
            if (subjectid == 1) {
                // <search all> selected for subject
                dbgNoteList('search all subjects, so no subjectid');
                subject_object = null;
                return;
            }
            if (subjectid == 0) {
                // if coming from /, no subjectid set, so get first one in list
                subjectid = subject_list[0]._id;
                dbgNoteList('setting initial subjectid of ' + subjectid);
            }
            subject_object = await Subject.find({_id:subjectid}, 'title topic', callback);
            dbgNoteList('subject_object ' + subject_object[0]);
        },
        // Get list of topics for this subject
        topic_list: async function(callback) {
            if (subjectid == 1) {
                // <search all> selected for subject so get all topics for display in list
                // However, we don't want this populated in the topic dropdown, as topics
                // without subject are headless. Handle this logic on client side topic dropdown
                dbgNoteList('search all subjects, so full topic_list');
                topic_list = await Topic.find({}, 'title subtopic');
            } else {
                // restrict to topics for this subject
                topic_list = await Topic.find({}, 'title subtopic').where('_id').in(subject_object[0].topic);
            }
            dbgNoteList('topic_list ' + topic_list);
        },
        // Get topic object
        topic_object: async function(callback) {
            if (topicid == 0) {
                // when subject is selected after <search all>, topicid is 0. The
                // topic list is populated (so notes list will show topics), but want to
                // leave topic selection dropdown as <search all> until topic is selected 
                topicid = 1;
            }
            if (topicid == 1) {
                // <search all> selected for topic
                dbgNoteList('search all topics, so no topicid');
                topic_object = null;
                return;
            }
            topic_object = await Topic.find({_id:topicid}, 'subtopic title');
            dbgNoteList('topic_object ' + topic_object[0]);
        },
        // Get list of subtopics for this topic
        subtopic_list: async function(callback) {
            if (topicid == 1) {
                // <search all> selected for topic so get all subtopics for display in list
                // However, we don't want this populated in the subtopic dropdown, as subtopics
                // without topic are headless. Handle this logic on client side subtopic dropdown
                dbgNoteList('search all topics, so full subtopic_list');
                subtopic_list = await Subtopic.find({}, 'title');
                return;
            }
            subtopic_list = await Subtopic.find({}, 'title').where('_id').in(topic_object[0].subtopic);
            dbgNoteList('subtopic_list ' + subtopic_list);
        },
        // Get subtopic object
        subtopic_object: async function(callback) {
            if (subtopicid == 0) {
                // when topic is selected after <search all>, subtopicid is 0. The
                // subtopic list is populated, but want to leave subtopic selection dropdown
                // as <search all> until subtopic is selected 
                subtopicid = 1;
            }
            if (subtopicid == 1) {
                // <search all> selected for subtopic
                dbgNoteList('search all subtopics, so no subtopicid');
                subtopic_object = null;
                return;
            }
            subtopic_object = await Subtopic.find({_id:subtopicid}, 'title description');
            dbgNoteList('subtopic_object ' + subtopic_object[0]);
        },
        // Get list of notes for this subject, topic and subtopic. Retrieve title and dates for list and ids for urls.
        note_list: async function (callback) {
            if (subtopicid == 1) {
                if (topicid == 1) {
                    if (subjectid == 1) {
                        dbgNoteList('subject, topic and subtopic <search all>');
                        note_list = await Note.find({}, 'title subject_id topic_id subtopic_id creationDate updateDate', callback);
                    } else {
                        dbgNoteList('topic and subtopic <search all>');
                        note_list = await Note.find({subject_id:subjectid}, 'title subject_id topic_id subtopic_id creationDate updateDate', callback);
                    }
                } else {
                    dbgNoteList('subtopic <search all> ' + subjectid + ':' + topicid);
                    note_list = await Note.find({subject_id:subjectid, topic_id:topicid}, 'title subject_id topic_id subtopic_id creationDate updateDate', callback);
                }
            } else {
                dbgNoteList('no <search all>');
                note_list = await Note.find({subject_id:subjectid, topic_id:topicid, subtopic_id:subtopicid}, 'title subject_id topic_id subtopic_id creationDate updateDate', callback);
            }
            dbgNoteList('note_list ' + note_list);
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
            dbgNoteList('note_count ' + note_count);
        },
    }, function(err, results) {
        if (err) {
            console.error('Error processing note list: ' + err);
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

var dbgNoteCreateGet = require('debug')('noteCreateGet');

// display note create page on GET.
exports.note_create_get = function(req, res, next) {
    render_create_page(req, res, next, null);
};

function render_create_page(req, res, next, errors) {
    var subjectid = req.params.subject;
    var topicid = req.params.topic;
    var subtopicid = req.params.subtopic;
    note_list = null;
    dbgNoteCreateGet('create subjectid ' + subjectid + ' topicid ' + topicid + ' subtopicid ' + subtopicid);
    async.series({
        // Get list of subject objects (three in array)
        subject_list: async function(callback) {
            subject_list = await Subject.find({}, 'title', callback);
            dbgNoteCreateGet('create subject_list ' + subject_list);
        },
        // Get the subject objects that match subjectid (one in array)
        subject_object: async function(callback) {
            // if coming from /, no subjectid set, so get first one in list
            if (subjectid) {
                if (subjectid == 0) {
                subjectid = subject_list[0]._id;
                dbgNoteCreateGet('create setting initial subjectid of ' + subjectid);
                }
            } else {
                subjectid = subject_list[0]._id;
            }
            subject_object = await Subject.find({_id:subjectid}, 'title topic', callback);
            dbgNoteCreateGet('create subject_object ' + subject_object[0]);
        },
        // Get list of topics for this subject
        topic_list: async function(callback) {
            topic_list = await Topic.find({}, 'title subtopic').where('_id').in(subject_object[0].topic);
            dbgNoteCreateGet('create topic_list ' + topic_list);
        },
        // Get list of topics for this subject
        topic_object: async function(callback) {
            if (topicid) {
                if (topicid == 0) {
                    topicid = subject_object[0].topic[0];
                    dbgNoteCreateGet('create setting initial topicid of ' + topicid);
                }
            }
            topic_object = await Topic.find({_id:topicid}, 'subtopic title');
            dbgNoteCreateGet('create topic_object ' + topic_object[0]);
        },
        // Get list of subtopics for this topic
        subtopic_list: async function(callback) {
            subtopic_list = await Subtopic.find({}, 'title').where('_id').in(topic_object[0].subtopic);
            dbgNoteCreateGet('create subtopic_list ' + subtopic_list);
        },
        subtopic_object: async function(callback) {
            if (subtopicid) {
                if (subtopicid == 0) {
                    subtopicid = topic_object[0].subtopic[0];
                    dbgNoteCreateGet('create setting initial subtopicid of ' + subtopicid);
                }
            }
            subtopic_object = await Subtopic.find({_id:subtopicid}, 'title description');
            dbgNoteCreateGet('create subtopic_object ' + subtopic_object[0]);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Need to clear note otherwise it is persisted after viewing another note
        res.locals.note = '';
        var enc_sig = getSHA256Hash();
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
            subtopic_description: subtopic_object[0].description,
            supersub_symbol_list: supersubSymbols,
            fraction_symbol_list: fractionSymbols,
            shape_symbol_list: shapeSymbols,
            symbol_symbol_list: symbolSymbols,
            operator_symbol_list: operatorSymbols,
            arrow_symbol_list: arrowSymbols,
            enc_sig: enc_sig,
            errors: errors
        });
    });
}

var dbgNoteCreatePost = require('debug')('noteCreatePost');

// handle note create on POST.
exports.note_create_post = [
    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        (async () => {
            var subjectid = req.body.subjectid;
            var topicid = req.body.topicid;
            var subtopicid = req.body.subtopicid;
            // Extract the validation errors from a request.
            const errors = await validationResult(req);
            var now = Date.now();
            // Create a Note object with escaped and trimmed data.
            var note = await new Note({
                title: req.body.title,
                lectureNote: req.body.lectureNote,
                creationDate: now,
                updateDate: now,
                keywords: req.body.keywords,
                questions: req.body.questions,
                comments: req.body.comments,
                summary: req.body.summary,
                subject_id: subjectid,
                topic_id: topicid,
                subtopic_id: subtopicid,
                image: image_url
            });
            if (!errors.isEmpty()) {
                // There are errors. Render form again with sanitized values/error messages.
                render_create_page(req, res, next, errors.array);
                return;
            }
            else {
                var tags = req.body.keywords.split(" ");
                require('dotenv').config();
                const cloudinary = require('cloudinary').v2;
                var image_url;
                var cl_error;
                var cl_result;
                var folder = req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid + '/' + note._id;
                // Save a blank drawing to cloudinary, just to create the folder for subsequent
                // storage of drawing and images
                dbgNoteCreatePost('sending image to cloudinary at ' + folder);
                var blankPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/1+yHgAHtAKYD9BncgAAAABJRU5ErkJggg==';
                await cloudinary.uploader.upload(blankPng,
                {
                    overwrite: true,
                    invalidate: true,
                    folder: folder,
                    tags: tags,
                    public_id: "drawing"
                })
                .then(result => cl_result = result)
                .catch(error => cl_error = error);
                // update note with image url
                if (cl_error) {
                    dbgNoteCreatePost('cl_error message: ' + cl_error.error.message);
                    var error = handle_cloudinary_error(cl_error);
                    render_create_page(req, res, next, [error]);
                    return;
                }
                image_url = cl_result.secure_url;
                dbgNoteCreatePost('cloudinary returned url ' + image_url);
                
                // Data from form is valid. Save note.
                note.image = image_url;
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

var dbgNoteUpdateGet = require('debug')('noteUpdateGet');

// display note update page on GET.
exports.note_update_get = function(req, res, next) {
    render_update_page(req, res, next, null);
};

function render_update_page(req, res, next, errors) {
    var subjectid = req.params.subject;
    var topicid = req.params.topic;
    var subtopicid = req.params.subtopic;
    var noteid = req.params.note;
    note_list = null;   // force to null, otherwise still existing from note list get
    dbgNoteUpdateGet('subjectid ' + subjectid + ' topicid ' + topicid + ' subtopicid ' + subtopicid + ' noteid ' + noteid);

    async.series({
        // Get list of subject objects (three in array)
        subject_list: async function(callback) {
            subject_list = await Subject.find({}, 'title', callback);
            dbgNoteUpdateGet('subject_list ' + subject_list);
        },
        // Get the subject objects that match subjectid (one in array)
        subject_object: async function(callback) {
            // if coming from /, no subjectid set, so get first one in list
            if (subjectid) {
                if (subjectid == 0) {
                  subjectid = subject_list[0]._id;
                  dbgNoteUpdateGet('setting initial subjectid of ' + subjectid);
                }
            } else {
                subjectid = subject_list[0]._id;
            }
            subject_object = await Subject.find({_id:subjectid}, 'title topic', callback);
            dbgNoteUpdateGet('subject_object ' + subject_object[0]);
        },
        // Get list of topics for this subject
        topic_list: async function(callback) {
            topic_list = await Topic.find({}, 'title subtopic').where('_id').in(subject_object[0].topic);
            dbgNoteUpdateGet('topic_list ' + topic_list);
        },
        // Get list of topics for this subject
        topic_object: async function(callback) {
            if (topicid) {
                if (topicid == 0) {
                    topicid = subject_object[0].topic[0];
                    dbgNoteUpdateGet('setting initial topicid of ' + topicid);
                }
            }
            topic_object = await Topic.find({_id:topicid}, 'subtopic title');
            dbgNoteUpdateGet('topic_object ' + topic_object[0]);
        },
        // Get list of subtopics for this topic
        subtopic_list: async function(callback) {
            subtopic_list = await Subtopic.find({}, 'title').where('_id').in(topic_object[0].subtopic);
            dbgNoteUpdateGet('subtopic_list ' + subtopic_list);
        },
        subtopic_object: async function(callback) {
            if (subtopicid) {
                if (subtopicid == 0) {
                    subtopicid = topic_object[0].subtopic[0];
                    dbgNoteUpdateGet('setting initial subtopicid of ' + subtopicid);
                }
            }
            subtopic_object = await Subtopic.find({_id:subtopicid}, 'title description');
            dbgNoteUpdateGet('subtopic_object ' + subtopic_object[0]);
        },
        // Get the note to be updated
        note_object: async function(callback) {
            note_object = await Note.findById(noteid).exec(callback);
            dbgNoteUpdateGet('note ' + note_object);
        },
        // Get number of notes with matching subjectid
        note_count: async function(callback) {
            note_count = await Note.countDocuments({subject_id:subjectid, topic_id:topicid, subtopic_id:subtopicid})
            .exec(callback);
            dbgNoteUpdateGet('note_count ' + note_count);
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
        var enc_sig = getSHA256Hash();
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
            subtopic_name: subtopic_object[0].title,
            subtopic_description: subtopic_object[0].description,
            supersub_symbol_list: supersubSymbols,
            fraction_symbol_list: fractionSymbols,
            shape_symbol_list: shapeSymbols,
            symbol_symbol_list: symbolSymbols,
            operator_symbol_list: operatorSymbols,
            arrow_symbol_list: arrowSymbols,
            enc_sig: enc_sig,
            errors: errors
        });
    });
}
var dbgNoteUpdatePost = require('debug')('noteUpdatePost');

// handle note update on POST.
exports.note_update_post = [
    // Validate and santitize fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        (async () => {
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
                image: req.body.image,   // use the cloud url instead of the image data
                _id:req.params.note // This is required, or a new ID will be assigned!
            });

            if (!errors.isEmpty()) {
                // There are errors. Render form again with sanitized values/error messages.
                render_update_page(req, res, next, errors.array);
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

var dbgNoteMoveGet = require('debug')('noteMoveGet');

// display note move page on GET
exports.note_move_get = function(req, res, next) {
    render_move_page(req, res, next, null);
};

function render_move_page(req, res, next, errors) {
    var noteid = req.params.note;
    var subjectid = req.params.subject;
    var topicid = req.params.topic;
    var subtopicid = req.params.subtopic;
    note_list = null;   // force to null, otherwise still existing from note list get
    dbgNoteMoveGet('move subjectid ' + subjectid + ' topicid ' + topicid + ' subtopicid ' + subtopicid + ' noteid ' + noteid);
    async.series({
        // Get list of subject objects (three in array)
        subject_list: async function(callback) {
            // always get full list of subjects whether subjectid is a subject or
            // a <search all> indicator (1)
            subject_list = await Subject.find({}, 'title', callback);
            dbgNoteMoveGet('subject_list ' + subject_list);
        },
        // Get the subject objects that match subjectid (one in array)
        subject_object: async function(callback) {
            if (subjectid == 1) {
                // <search all> selected for subject
                dbgNoteMoveGet('search all subjects, so no subjectid');
                subject_object = null;
                return;
            }
            if (subjectid == 0) {
                // if coming from /, no subjectid set, so get first one in list
                subjectid = subject_list[0]._id;
                dbgNoteMoveGet('setting initial subjectid of ' + subjectid);
            }
            subject_object = await Subject.find({_id:subjectid}, 'title topic', callback);
            dbgNoteMoveGet('subject_object ' + subject_object[0]);
        },
        // Get list of topics for this subject
        topic_list: async function(callback) {
            if (subjectid == 1) {
                // <search all> selected for subject
                dbgNoteMoveGet('search all subjects, so empty topic_list');
                topic_list = [];
                return;
            }
            topic_list = await Topic.find({}, 'title subtopic').where('_id').in(subject_object[0].topic);
            dbgNoteMoveGet('topic_list ' + topic_list);
        },
        // Get list of topics for this subject
        topic_object: async function(callback) {
            if (topicid == 1) {
                // <search all> selected for topic
                dbgNoteMoveGet('search all topics, so no topicid');
                topic_object = null;
                return;
            }
            if (topicid == 0) {
                topicid = topic_list[0]._id;
                dbgNoteMoveGet('setting initial topicid of ' + topicid);
            }
            topic_object = await Topic.find({_id:topicid}, 'subtopic title');
            dbgNoteMoveGet('topic_object ' + topic_object[0]);
        },
        // Get list of subtopics for this topic
        subtopic_list: async function(callback) {
            if (topicid == 1) {
                // <search all> selected for topic
                dbgNoteMoveGet('search all topics, so empty subtopic_list');
                subtopic_list = [];
                return;
            }
            subtopic_list = await Subtopic.find({}, 'title').where('_id').in(topic_object[0].subtopic);
            dbgNoteMoveGet('subtopic_list ' + subtopic_list);
        },
        subtopic_object: async function(callback) {
            if (subtopicid == 1) {
                // <search all> selected for subtopic
                dbgNoteMoveGet('search all subtopics, so no subtopicid');
                subtopic_object = null;
                return;
            }
            if (subtopicid == 0) {
                subtopicid = subtopic_list[0]._id;
                dbgNoteMoveGet('setting initial subtopicid of ' + subtopicid);
            }
            subtopic_object = await Subtopic.find({_id:subtopicid}, 'title description');
            dbgNoteMoveGet('subtopic_object ' + subtopic_object[0]);
        },
        // Get note
        note_object: async function (callback) {
            note_object = await Note.findById(noteid, 'title subject_id topic_id subtopic_id creationDate updateDate image', callback);
            dbgNoteMoveGet('note_object ' + note_object);
        },
    }, function(err, results) {
        if (err) {
            console.error('Error processing note list: ' + err);
            return next(err);
        }

        note_object.title = decodeEntities(note_object.title);
        var subject_name = null;
        if (subject_object !== null) {
            subject_name = subject_object[0].title;
        }
        var topic_name = null;
        if (topic_object !== null) {
            topic_name = topic_object[0].title;
        }
        dbgNoteMoveGet('note_object._id ' + note_object._id);
        res.render('note_move', {
            title: 'Move',
            note: note_object,
            subject_list: subject_list,
            topic_list: topic_list,
            subjectid: subjectid,
            topicid: topicid,
            subtopicid: subtopicid,
            subtopic_list: subtopic_list,
            subject_name: subject_name,
            topic_name: topic_name,
            subtopic_name: subtopic_object[0].title,
            subtopic_description: subtopic_object[0].description,
            errors: errors
        } );
    });
}

var dbgNoteMovePost = require('debug')('noteMovePost');

// handle note move on POST
exports.note_move_post = function(req, res, next) {
    // Move note and redirect to the list of notes.
    Note.findById(req.body.noteid, function moveNote(err) {
        if (err) { return next(err); }
        // Success - got to notes list.
        dbgNoteMovePost('found note to move');
        var now = Date.now();
        (async () => {
            // Create note in new location
            var newnote = await new Note({
                title: req.body.title,
                lectureNote: req.body.lectureNote,
                creationDate: req.body.creationDate,
                updateDate: now,
                keywords: req.body.keywords,
                questions: req.body.questions,
                comments: req.body.comments,
                summary: req.body.summary,
                subject_id: req.body.newsubjectid,
                topic_id: req.body.newtopicid,
                subtopic_id: req.body.newsubtopicid,
            });
            require('dotenv').config();
            const cloudinary = require('cloudinary').v2;
            var image_url;
            var cl_error;
            var cl_result;
            var oldFilePath = req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid + '/' + req.body.noteid;
            var newFilePath = req.body.newsubjectid + '/' + req.body.newtopicid + '/' + req.body.newsubtopicid + '/' + newnote._id;
            dbgNoteMovePost('About to move cloudinary folder from ' + oldFilePath + ' to ' + newFilePath);
            await cloudinary.uploader.rename(oldFilePath, newFilePath, {})
            .then(result => cl_result = result)
            .catch(error => cl_error = error);
            // update note with image url
            if (cl_error) {
                var error = handle_cloudinary_error(cl_error);
                render_move_page(req, res, next, [error]);
                return;
            }
            image_url = cl_result.secure_url;
            dbgNoteMovePost('cloudinary returned url ' + image_url);
            // update note with image url
            newnote.image = image_url;
            // Data from form is valid. Save note.
            newnote.save(function (err) {
                if (err) {
                    return next(err);
                }
                //successful - redirect to new note record.
                res.redirect(newnote.list_url);
                // (or note list perhaps?)
                //var redirect = '/' + req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid + '/notes';
                //dbgNoteMovePost('redirect to ' + redirect);
                //res.redirect(redirect);
            });
        })();
    });
};

var dbgNoteDeleteGet = require('debug')('noteDeleteGet');

// display note delete page on GET.
exports.note_delete_get = function(req, res, next) {
    render_delete_page(req, res, next, null);
};

function render_delete_page(req, res, next, errors) {
    var noteid = req.params.note;
    var subjectid = req.params.subject;
    var topicid = req.params.topic;
    var subtopicid = req.params.subtopic;
    note_list = null;   // force to null, otherwise still existing from note list get
    dbgNoteDeleteGet('delete subjectid ' + subjectid + ' topicid ' + topicid + ' subtopicid ' + subtopicid + ' noteid ' + noteid);
    async.series({
        // Get list of subject objects (three in array)
        subject_list: async function(callback) {
            // always get full list of subjects whether subjectid is a subject or
            // a <search all> indicator (1)
            subject_list = await Subject.find({}, 'title', callback);
            dbgNoteDeleteGet('subject_list ' + subject_list);
        },
        // Get the subject objects that match subjectid (one in array)
        subject_object: async function(callback) {
            if (subjectid == 1) {
                // <search all> selected for subject
                dbgNoteDeleteGet('search all subjects, so no subjectid');
                subject_object = null;
                return;
            }
            if (subjectid == 0) {
                // if coming from /, no subjectid set, so get first one in list
                subjectid = subject_list[0]._id;
                dbgNoteDeleteGet('setting initial subjectid of ' + subjectid);
            }
            subject_object = await Subject.find({_id:subjectid}, 'title topic', callback);
            dbgNoteDeleteGet('subject_object ' + subject_object[0]);
        },
        // Get list of topics for this subject
        topic_list: async function(callback) {
            if (subjectid == 1) {
                // <search all> selected for subject
                dbgNoteDeleteGet('search all subjects, so empty topic_list');
                topic_list = [];
                return;
            }
            topic_list = await Topic.find({}, 'title subtopic').where('_id').in(subject_object[0].topic);
            dbgNoteDeleteGet('topic_list ' + topic_list);
        },
        // Get list of topics for this subject
        topic_object: async function(callback) {
            if (topicid == 1) {
                // <search all> selected for topic
                dbgNoteDeleteGet('search all topics, so no topicid');
                topic_object = null;
                return;
            }
            if (topicid == 0) {
                topicid = topic_list[0]._id;
                dbgNoteDeleteGet('setting initial topicid of ' + topicid);
            }
            topic_object = await Topic.find({_id:topicid}, 'subtopic title');
            dbgNoteDeleteGet('topic_object ' + topic_object[0]);
        },
        // Get list of subtopics for this topic
        subtopic_list: async function(callback) {
            if (topicid == 1) {
                // <search all> selected for topic
                dbgNoteDeleteGet('search all topics, so empty subtopic_list');
                subtopic_list = [];
                return;
            }
            subtopic_list = await Subtopic.find({}, 'title').where('_id').in(topic_object[0].subtopic);
            dbgNoteDeleteGet('subtopic_list ' + subtopic_list);
        },
        subtopic_object: async function(callback) {
            if (subtopicid == 1) {
                // <search all> selected for subtopic
                dbgNoteDeleteGet('search all subtopics, so no subtopicid');
                subtopic_object = null;
                return;
            }
            if (subtopicid == 0) {
                subtopicid = subtopic_list[0]._id;
                dbgNoteDeleteGet('setting initial subtopicid of ' + subtopicid);
            }
            subtopic_object = await Subtopic.find({_id:subtopicid}, 'title description');
            dbgNoteDeleteGet('subtopic_object ' + subtopic_object[0]);
        },
        // Get note
        note_object: async function (callback) {
            note_object = await Note.findById(noteid, 'title subject_id topic_id subtopic_id creationDate updateDate image', callback);
            dbgNoteDeleteGet('note_object ' + note_object);
        },
    }, function(err, results) {
        if (err) {
            console.error('Error processing note list: ' + err);
            return next(err);
        }

        note_object.title = decodeEntities(note_object.title);
        var subject_name = null;
        if (subject_object !== null) {
            subject_name = subject_object[0].title;
        }
        var topic_name = null;
        if (topic_object !== null) {
            topic_name = topic_object[0].title;
        }
        dbgNoteDeleteGet('note_object._id ' + note_object._id);
        res.render('note_delete', {
            title: 'Delete',
            note: note_object,
            subject_list: subject_list,
            topic_list: topic_list,
            subjectid: subjectid,
            topicid: topicid,
            subtopicid: subtopicid,
            subtopic_list: subtopic_list,
            subject_name: subject_name,
            topic_name: topic_name,
            subtopic_name: subtopic_object[0].title,
            subtopic_description: subtopic_object[0].description,
            errors: errors
        } );
    });
}
var dbgNoteDeletePost = require('debug')('noteDeletePost');

// handle note delete on POST.
exports.note_delete_post = function(req, res, next) {
    // Delete object and redirect to the list of notes.
    Note.findByIdAndRemove(req.body.noteid, function deleteNote(err) {
        if (err) { return next(err); }
        // Success - got to notes list.
        dbgNoteDeletePost('found note to delete');
        (async () => {
            require('dotenv').config();
            const cloudinary = require('cloudinary').v2;
            var image_url;
            var cl_error;
            var cl_result;
            var filePath = req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid + '/' + req.body.noteid;
            dbgNoteDeletePost('About to delete image from cloudinary ' + filePath);
            await cloudinary.uploader.destroy(filePath, {})
            .then(result => cl_result = result)
            .catch(error => cl_error = error);
            // update note with image url
            if (cl_error) {
                dbgNoteDeletePost('cl_error message: ' + cl_error.error.message);
                var error = handle_cloudinary_error(cl_error);
                render_move_page(req, res, next, [error]);
                return;
            }
            image_url = cl_result.secure_url;
            dbgNoteDeletePost('cloudinary returned url ' + image_url);
        })();
        var redirect = '/' + req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid + '/notes';
        dbgNoteDeletePost('redirect to ' + redirect);
        res.redirect(redirect);
    });
};

var dbgNoteDrawGet = require('debug')('noteDrawGet');

// display drawing page on GET.
exports.note_draw_get = function(req, res, next) {
    render_draw_page(req, res, next, null);
};

function render_draw_page(req, res, next, errors) {
    var noteid = req.params.note;
    var subjectid = req.params.subject;
    var topicid = req.params.topic;
    var subtopicid = req.params.subtopic;
    note_list = null;   // force to null, otherwise still existing from note list get
    dbgNoteDrawGet('draw noteid ' + noteid);
    async.series({
        // Get note
        note_object: async function (callback) {
            note_object = await Note.findById(noteid, 'title subject_id topic_id subtopic_id image', callback);
            dbgNoteDrawGet('note_object ' + note_object);
        },
    }, function(err, results) {
        if (err) {
            console.error('Error processing draw: ' + err);
            return next(err);
        }

        dbgNoteDrawGet('note_object ' + note_object);
        res.setHeader('Cache-Control', 'no-cache');
        res.render('note_draw', {
            title: note_object.title,
            note: note_object,
            subjectid: subjectid,
            topicid: topicid,
            subtopicid: subtopicid,
            noteid: noteid,
            errors: errors
        } );
    });
}
var dbgNoteDrawPost = require('debug')('noteDrawPost');

// handle note drawing on POST.
exports.note_draw_post = function(req, res, next) {
    (async () => {
        var folder = req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid + '/' + req.params.note;
        require('dotenv').config();
        const cloudinary = require('cloudinary').v2;
        var image_url;
        var cl_error;
        var cl_result;
        dbgNoteDrawPost('sending image to cloudinary: ' + folder);
        await cloudinary.uploader.upload(req.body.imageData,
        {
            // Store drawing in folder with 'drawing' as name
            overwrite: true,
            invalidate: true,
            folder: folder,
            public_id: "drawing"
        })
        .then(result => cl_result = result)
        .catch(error => cl_error = error);
        if (cl_error) {
            var error = handle_cloudinary_error(cl_error);
            render_draw_page(req, res, next, [error]);
            return;
        }
        var redirect = '/' + req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid + '/notes';
        dbgNoteDrawPost('redirect to ' + redirect);
        res.redirect(redirect);
    })();
};
var dbgError = require('debug')('error');

function handle_cloudinary_error(cl_error) {
    if (cl_error.error) {
        dbgError('error message: ' + cl_error.error.message);
        var error = '';
        if (cl_error.error.code == 'SELF_SIGNED_CERT_IN_CHAIN') {
            // Unable to contact cloudinary, possibly due to network error.
            error = 'unable to access cloudinary so cannot write or read image data. Check if connected to the internet or blocked by a vpn';
        } else {
            error = cl_error.error.message;
        }
    } else {
        error = cl_error.message;
    }
    return(error);
}