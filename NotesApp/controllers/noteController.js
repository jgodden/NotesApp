const { body,validationResult } = require('express-validator');
var Note = require('../models/note');
var Subject = require('../models/subject');
var Topic = require('../models/topic');
var Subtopic = require('../models/subtopic');

var async = require('async');
const topic = require('../models/topic');
const note = require('../models/note');
const { monitorEventLoopDelay } = require('perf_hooks');

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

var dbgNoteList = require('debug')('noteList');

// Display list of all Notes.
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
                // <search all> selected for subject
                dbgNoteList('search all subjects, so empty topic_list');
                topic_list = [];
                return;
            }
            topic_list = await Topic.find({}, 'title subtopic').where('_id').in(subject_object[0].topic);
            dbgNoteList('topic_list ' + topic_list);
        },
        // Get list of topics for this subject
        topic_object: async function(callback) {
            if (topicid == 1) {
                // <search all> selected for topic
                dbgNoteList('search all topics, so no topicid');
                topic_object = null;
                return;
            }
            if (topicid == 0) {
                topicid = topic_list[0]._id;
                dbgNoteList('setting initial topicid of ' + topicid);
            }
            topic_object = await Topic.find({_id:topicid}, 'subtopic title');
            dbgNoteList('topic_object ' + topic_object[0]);
        },
        // Get list of subtopics for this topic
        subtopic_list: async function(callback) {
            if (topicid == 1) {
                // <search all> selected for topic
                dbgNoteList('search all topics, so empty subtopic_list');
                subtopic_list = [];
                return;
            }
            subtopic_list = await Subtopic.find({}, 'title').where('_id').in(topic_object[0].subtopic);
            dbgNoteList('subtopic_list ' + subtopic_list);
        },
        subtopic_object: async function(callback) {
            if (subtopicid == 1) {
                // <search all> selected for subtopic
                dbgNoteList('search all subtopics, so no subtopicid');
                subtopic_object = null;
                return;
            }
            if (subtopicid == 0) {
                subtopicid = subtopic_list[0]._id;
                dbgNoteList('setting initial subtopicid of ' + subtopicid);
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

// Display Note create form on GET.
exports.note_create_get = function(req, res, next) {
    var subjectid = req.params.subject;
    var topicid = req.params.topic;
    var subtopicid = req.params.subtopic;
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
            subtopic_description: subtopic_object[0].description
        });
    });
};

var dbgNoteCreatePost = require('debug')('noteCreatePost');

// Handle Note create on POST.
exports.note_create_post = [
    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('lectureNote', 'Lecture Note must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // For local image files
        var fs;
        const filename = 'newNote';
        var cloudinary;

        if (usingInternet === 1) {
            require('dotenv').config();
            cloudinary = require('cloudinary').v2;
        } else {
            fs = require('fs');
        }
        var image_url = req.body.imageUrl;
        var folder = req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid;
        (async () => {
            if (usingInternet === 1) {
                dbgNoteCreatePost('sending image to cloudinary');
                var tags = req.body.keywords.split(" ");
                var uploadResponse = '';

                    var uploadResponse = '';
                    // Save the canvas image to cloud
                    await cloudinary.uploader.upload(req.body.imageData,
                    {
                        overwrite: true,
                        invalidate: true,
                        folder: folder,
                        tags: tags,
                        public_id: filename
                    })
                    .then(uploadResult => uploadResponse = uploadResult);
                    image_url = uploadResponse.url;
                    dbgNoteCreatePost('got image url ' + image_url + ' from cloudinary');
            } else {
                const base_filestore = 'C:/Users/jon/NotesApp';
                image_url = base_filestore + '/' + folder;
                // create folder if it doesn't exist
                fs.mkdirSync(base_filestore + '/' + folder, { recursive: true }, (err) => {
                    if (err) throw err;
                    dbgNoteCreatePost('Folder created: ' + base_filestore + '/' + folder);
                });
                fs.writeFileSync(image_url + '/' + filename, req.body.imageData, function (err) {
                    if (err) throw err;
                    dbgNoteCreatePost('Image saved: ' + image_url);
                });
            }
            
            dbgNoteCreatePost('image_url: ' + image_url);

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
                // Now we have created the new note object, rename the local file and the
                // image property to use its id before saving it to db.
                var oldLeaf = '/' + filename;
                var newLeaf = '/' + note._id;
                if (usingInternet === 0) {
                    fs.renameSync(image_url + oldLeaf, image_url + newLeaf);
                    note.image = 'http://127.0.0.1:8080/' + image_url + newLeaf;
                } else {
                    await cloudinary.uploader.rename(folder + oldLeaf, folder + newLeaf,                    {
                        overwrite: true,
                        invalidate: true
                    });
                    // update filename in note.image
                    dbgNoteCreatePost('rename ' + note.image);
                    note.image = note.image.replace(/\/[^\/]*$/, '/' + note._id);
                    dbgNoteCreatePost('to ' + note.image);
                }
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

var dbgNoteDeleteGet = require('debug')('noteDeleteGet');

// Display Note delete form on GET.
exports.note_delete_get = function(req, res, next) {
    var noteid = req.params.note;
    var subjectid = req.params.subject;
    var topicid = req.params.topic;
    var subtopicid = req.params.subtopic;
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
            subtopic_description: subtopic_object[0].description
        } );
    });
};

var dbgNoteDeletePost = require('debug')('noteDeletePost');

// Handle Note delete on POST.
exports.note_delete_post = function(req, res, next) {
    // Delete object and redirect to the list of notes.
    Note.findByIdAndRemove(req.body.noteid, function deleteNote(err) {
        if (err) { return next(err); }
        // Success - got to notes list.
        dbgNoteDeletePost('found note to delete');
        (async () => {
            var fs;
            var cloudinary;
    
            if (usingInternet === 1) {
                require('dotenv').config();
                cloudinary = require('cloudinary').v2;
            } else {
                fs = require('fs');
            }
            var filePath = req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid + '/' + req.body.noteid;
            dbgNoteDeletePost('image to delete: ' + filePath);
            if (usingInternet === 1) {
                dbgNoteDeletePost('About to delete image from cloudinary');
                await cloudinary.uploader.destroy(filePath, {})
                .then(deleteResult => deleteResponse = deleteResult);
                dbgNoteDeletePost('Image deleted from cloudinary: ' + deleteResponse);
            } else {
                const base_filestore = 'C:/Users/jon/NotesApp';
                image_url = base_filestore + '/' + filePath;
                fs.unlinkSync(image_url + '/' + filename, function (err) {
                    if (err) throw err;
                    dbgNoteDeletePost('Image deleted: ' + image_url);
                });
            }
        })();
        var redirect = '/repo/' + req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid + '/notes';
        dbgNoteDeletePost('redirect to ' + redirect);
        res.redirect(redirect);
    });
};

var dbgNoteUpdateGet = require('debug')('noteUpdateGet');

// Display Note update form on GET.
exports.note_update_get = function(req, res, next) {
    var subjectid = req.params.subject;
    var topicid = req.params.topic;
    var subtopicid = req.params.subtopic;
    var noteid = req.params.note;
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
            subtopic_description: subtopic_object[0].description
        });
    });
};

var dbgNoteUpdatePost = require('debug')('noteUpdatePost');

// Handle Note update on POST.
exports.note_update_post = [
    // Validate and santitize fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('lectureNote', 'Lecture Note must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        var image_url = req.body.imageUrl;
        var folder = req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid;
        if (usingInternet === 1) {
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
            })();
        } else {
            const base_filestore = 'C:/Users/jon/NotesApp';
            image_url = base_filestore + '/' + folder;
            // create folder if it doesn't exist
            fs.mkdirSync(base_filestore + '/' + folder, { recursive: true }, (err) => {
                if (err) throw err;
                dbgNoteCreatePost('Folder created: ' + base_filestore + '/' + folder);
            });
            fs.writeFileSync(image_url + '/' + filename, req.body.imageData, function (err) {
                if (err) throw err;
                dbgNoteCreatePost('Image saved: ' + image_url);
              });
        }
            
        dbgNoteCreatePost('image_url: ' + image_url);

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
                image: image_url,   // use the cloud url instead of the image data
                _id:req.params.note // This is required, or a new ID will be assigned!
            });

            if (!errors.isEmpty() || (image_err == 1)) {
                // There are errors. Render form again with sanitized values/error messages.
                res.render('note_form', { note: note });
                return;
            }
            else {
                dbgNoteUpdatePost('no errors so render page');
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
