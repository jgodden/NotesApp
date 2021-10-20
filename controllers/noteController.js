const { body, validationResult } = require('express-validator');
const Note = require('../models/note');
const Subject = require('../models/subject');
const Topic = require('../models/topic');
const Subtopic = require('../models/subtopic');
const Link = require('../models/link');
const ObjectId = require('mongodb').ObjectId;

const async = require('async');
const user = require('../models/user');

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

// ids and lists for subject, topic and subtopic set by note_list and stored for use in all pages
// so they can be passed to common layout pug. Also subtopic description
var subjectId;
var topicId;
var subtopicId;
var subjectList;
var topicList;
var subtopicList;
var linkList;

// display logout page on GET /.
exports.logout_page = function(req, res, next) {
    res.render('index', { title: 'notes' });
};

var dbgNoteList = require('debug')('noteList');

// display note list page on GET.
exports.note_list = function(req, res, next) {
    render_list_page(req, res, next, null);
};

function render_list_page(req, res, next, errors) {
    subjectId = req.params.subject;
    topicId = req.params.topic;
    subtopicId = req.params.subtopic;
    var subjectName;
    var topicName;
    var subtopicName;
    dbgNoteList('subjectId ' + subjectId + ' topicId ' + topicId + ' subtopicId ' + subtopicId);
    async.series({
        // Get list of subject objects (three in array)
        subjectList: async function(callback) {
            // always get full list of subjects whether subjectid is a subject or
            // a <search all> indicator (1)
            subjectList = await Subject.find({}, 'title', callback);
            dbgNoteList('subjectList', subjectList);
        },
        // Get the subject objects that match subjectid (one in array)
        subjectObject: async function(callback) {
            if (subjectId == 1) {
                // <search all> selected for subject
                dbgNoteList('search all subjects, so no subjectId');
                subjectObject = null;
                return;
            }
            if (subjectId == 0) {
                // if coming from /, no subjectid set, so get first one in list
                subjectId = subject_list[0]._id;
                dbgNoteList('setting initial subjectId of', subjectId);
            }
            subjectObject = await Subject.find({_id:subjectId}, 'title topic link', callback);
            subjectName = subjectObject[0].title;
            dbgNoteList('subjectObject', subjectObject[0]);
        },
        // Get list of topics for this subject
        topicList: async function(callback) {
            if (subjectId == 1) {
                // <search all> selected for subject so get all topics for display in list
                // However, we don't want this populated in the topic dropdown, as topics
                // without subject are headless. Handle this logic on client side topic dropdown
                dbgNoteList('search all subjects, so full topicList');
                topicList = await Topic.find({}, 'title subtopic');
            } else {
                // restrict to topics for this subject
                topicList = await Topic.find({}, 'title subtopic').where('_id').in(subjectObject[0].topic);
            }
            dbgNoteList('topicList', topicList);
        },
        // Get topic object
        topicObject: async function(callback) {
            if (topicId == 0) {
                // when subject is selected after <search all>, topicid is 0. The
                // topic list is populated (so notes list will show topics), but want to
                // leave topic selection dropdown as <search all> until topic is selected 
                topicId = 1;
            }
            if (topicId == 1) {
                // <search all> selected for topic
                dbgNoteList('search all topics, so no topicid');
                topicObject = null;
                return;
            }
            topicObject = await Topic.find({_id:topicId}, 'subtopic title');
            topicName = topicObject[0].title;
            dbgNoteList('topicObject', topicObject[0]);
        },
        // Get list of subtopics for this topic
        subtopicList: async function(callback) {
            if (topicId == 1) {
                // <search all> selected for topic so get all subtopics for display in list
                // However, we don't want this populated in the subtopic dropdown, as subtopics
                // without topic are headless. Handle this logic on client side subtopic dropdown
                dbgNoteList('search all topics, so full subtopicList');
                subtopicList = await Subtopic.find({}, 'title description');
                return;
            }
            subtopicList = await Subtopic.find({}, 'title description').where('_id').in(topicObject[0].subtopic);
            dbgNoteList('subtopicList', subtopicList);
        },
        // Get subtopic object
        subtopicObject: async function(callback) {
            if (subtopicId == 0) {
                // when topic is selected after <search all>, subtopicid is 0. The
                // subtopic list is populated, but want to leave subtopic selection dropdown
                // as <search all> until subtopic is selected 
                subtopicId = 1;
            }
            if (subtopicId == 1) {
                // <search all> selected for subtopic
                dbgNoteList('search all subtopics, so no subtopicId');
                subtopicObject = null;
                return;
            }
            subtopicObject = await Subtopic.find({_id:subtopicId}, 'title');
            subtopicName = subtopicObject[0].title;
            dbgNoteList('subtopicObject', subtopicObject[0]);
        },
        linkList: async function(callback) {
            if (subjectId == 1) {
                dbgNoteList('search all subjects, so no linkList');
                linkList = null;
            } else {
                // restrict to topics for this subject
                dbgNoteList('so.link:', subjectObject[0].link);
                linkList = await Link.find({}, 'title href category').where('_id').in(subjectObject[0].link);
            }
            dbgNoteList('linkList', linkList);
        },
        // Get list of notes for this subject, topic and subtopic. Retrieve title and dates for list and ids for urls.
        noteList: async function (callback) {
            if (subtopicId == 1) {
                if (topicId == 1) {
                    if (subjectId == 1) {
                        dbgNoteList('subject, topic and subtopic <search all>');
                        noteList = await Note.find({}, 'title subject topic subtopic creationDate updateDate', callback);
                    } else {
                        dbgNoteList('topic and subtopic <search all>');
                        noteList = await Note.find({subject:ObjectId(subjectId)}, 'title subject topic subtopic creationDate updateDate', callback);
                    }
                } else {
                    dbgNoteList('subtopic <search all> ' + subjectId + ':' + topicId);
                    noteList = await Note.find({subject:ObjectId(subjectId), topic:ObjectId(topicId)}, 'title subject topic subtopic creationDate updateDate', callback);
                }
            } else {
                dbgNoteList('no <search all>');
                noteList = await Note.find({subject:ObjectId(subjectId), topic:ObjectId(topicId), subtopic:ObjectId(subtopicId)}, 'title subject topic subtopic creationDate updateDate', callback);
            }
            //dbgNoteList('noteList', noteList);
        },
        // Get number of notes with matching subjectid
        noteCount: async function(callback) {
            if (subtopicId == 1) {
                if (topicId == 1) {
                    if (subjectId == 1) {
                        noteCount = await Note.countDocuments({}, callback);
                    } else {
                        noteCount = await Note.countDocuments({subject:ObjectId(subjectId)}, callback);
                    }
                } else {
                    noteCount = await Note.countDocuments({subject:subjectId, topic:topicId}, callback);
                }
            } else {
                noteCount = await Note.countDocuments({subject:ObjectId(subjectId), topic:ObjectId(topicId), subtopic:ObjectId(subtopicId)}, callback);
            }
            dbgNoteList('noteCount', noteCount);
        },
    }, function(err, results) {
        if (err) {
            console.error('Error processing note list: ' + err);
            return next(err);
        }
        noteList.forEach(function (item, index) {
            item.title = decodeEntities(item.title);
        });
        dbgNoteList('user', theUser);
        res.render('note_list', {
            title: 'List',
            note_count: noteCount,
            note_list: noteList,
            subjectid: subjectId,
            subject_list: subjectList,
            topicid: topicId,
            topic_list: topicList,
            subtopicid: subtopicId,
            subtopic_list: subtopicList,
            link_list: linkList,
            subject_name: subjectName,
            topic_name: topicName,
            subtopic_name: subtopicName,
            user: theUser,
            errors: errors
        } );
    });
}

var dbgNoteCreateGet = require('debug')('noteCreateGet');

// display note create page on GET.
exports.note_create_get = function(req, res, next) {
    render_create_page(req, res, next, null);
};

function render_create_page(req, res, next, errors) {
    note_list = null;
    dbgNoteCreateGet('create');
    // Need to clear note otherwise it is persisted after viewing another note
    res.locals.note = '';
    var enc_sig = getSHA256Hash();
    res.render('note_form', {
        title: 'Create',
        subjectid: subjectId,
        subject_list: subjectList,
        topicid: topicId,
        topic_list: topicList,
        subtopicid: subtopicId,
        subtopic_list: subtopicList,
        link_list: linkList,
        enc_sig: enc_sig,
        errors: errors
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
                subject: ObjectId(subjectId),
                topic: ObjectId(topicId),
                subtopic: ObjectId(subtopicId),
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
                dbgNoteCreatePost('sending image to cloudinary at', folder);
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
                    var error = handle_cloudinary_error(cl_error);
                    render_create_page(req, res, next, [error]);
                    return;
                }
                image_url = cl_result.secure_url;
                dbgNoteCreatePost('cloudinary returned url', image_url);
                
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
    var noteid = req.params.note;
    note_list = null;   // force to null, otherwise still existing from note list get
    dbgNoteUpdateGet('update');
    async.series({
        // Get the note to be updated
        note_object: async function(callback) {
            note_object = await Note.findById(noteid, callback);
            dbgNoteUpdateGet('note', note_object);
            if (subjectId < 2) {
                subjectId = note_object.subject._id;
                // and update the link list
                subjectObject = await Subject.find({_id:subjectId}, 'title topic link', callback);
                linkList = await Link.find({}, 'title href category').where('_id').in(subjectObject[0].link);
                dbgNoteUpdateGet("set subjectId to", subjectId);
            }
            if (topicId < 2) {
                topicId = note_object.topic._id;
                dbgNoteUpdateGet('set topicId to', topicId);
            }
            if (subtopicId < 2) {
                subtopicId = note_object.subtopic._id;
                dbgNoteUpdateGet("set subtopicId to", subtopicId);
            }            
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
            subjectid: subjectId,
            subject_list: subjectList,
            topicid: topicId,
            topic_list: topicList,
            subtopicid: subtopicId,
            subtopic_list: subtopicList,
            link_list: linkList,
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
            const errors = validationResult(req);
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
                subject: ObjectId(req.body.subjectid),
                topic: ObjectId(req.body.topicid),
                subtopic: ObjectId(req.body.subtopicid),
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

var newSubjectId = 1;
var newTopicId = 1;
var newSubtopicId = 1;
function render_move_page(req, res, next, errors) {
    let subjectChanged = false;
    if (newSubjectId != req.params.subject) {
        newSubjectId = req.params.subject;
        subjectChanged = true;
    }
    let topicChanged = false;
    if (newTopicId != req.params.topic) {
        newTopicId = req.params.topic;
        topicChanged = true;
    }
    newSubtopicId = req.params.subtopic;
    var noteid = req.params.note;
    note_list = null;   // force to null, otherwise still existing from note list get
    dbgNoteMoveGet('move newSubjectId', newSubjectId + ' newTopicId ' + newTopicId + ' newSubtopicId ' + newSubtopicId);
    async.series({
        // Get list of subject objects (three in array)
        newSubjectList: async function(callback) {
            // always get full list of subjects whether subjectid is a subject or
            // a <search all> indicator (1)
            newSubjectList = await Subject.find({}, 'title', callback);
            dbgNoteMoveGet('newSubjectList', newSubjectList);
        },
        // Get the subject objects that match subjectid (one in array)
        newSubjectObject: async function(callback) {
            newSubjectObject = await Subject.find({_id:newSubjectId}, 'title topic', callback);
            dbgNoteMoveGet('newSubjectObject', newSubjectObject[0]);
        },
        // Get list of topics for this subject
        newTopicList: async function(callback) {
            newTopicList = await Topic.find({}, 'title subtopic').where('_id').in(newSubjectObject[0].topic);
            if (subjectChanged)
                newTopicId = newTopicList[0]._id;
            dbgNoteMoveGet('newTopicList', newTopicList);
        },
        // Get list of topics for this subject
        newTopicObject: async function(callback) {
            newTopicObject = await Topic.find({_id:newTopicId}, 'subtopic title');
            dbgNoteMoveGet('newTopicObject', newTopicObject[0]);
        },
        // Get list of subtopics for this topic
        newSubtopicList: async function(callback) {
            newSubtopicList = await Subtopic.find({}, 'title').where('_id').in(newTopicObject[0].subtopic);
            if (topicChanged)
                newSubtopicId = newSubtopicList[0]._id;
            dbgNoteMoveGet('newSubtopicList', newSubtopicList);
        },
        newSubtopicObject: async function(callback) {
            newSubtopicObject = await Subtopic.find({_id:newSubtopicId}, 'title description');
            dbgNoteMoveGet('newSubtopicObject ' + newSubtopicObject[0]);
        },
        // Get note
        note_object: async function (callback) {
            note_object = await Note.findById(noteid, 'title subject topic subtopic creationDate updateDate image', callback);
            dbgNoteMoveGet('note_object ' + note_object);
        },
    }, function(err, results) {
        if (err) {
            console.error('Error processing note list: ' + err);
            return next(err);
        }

        note_object.title = decodeEntities(note_object.title);
        dbgNoteMoveGet('note_object._id', note_object._id);
        // subject, topic and subtopic ids passed in so destination location can be initialised to same
        // as source. Seems more likely that destination will have one or more of these in common with the
        // source. Lists also passed in for dropdowns, and subtopic description for display on nav window
        res.render('note_move', {
            title: 'Move',
            note: note_object,
            subjectid: subjectId,
            subject_list: subjectList,
            topicid: topicId,
            topic_list: topicList,
            subtopicid: subtopicId,
            subtopic_list: subtopicList,
            link_list: linkList,
            new_subjectid: newSubjectId,
            new_subject_list: newSubjectList,
            new_topicid: newTopicId,
            new_topic_list: newTopicList,
            new_subtopicid: newSubtopicId,
            new_subtopic_list: newSubtopicList,
            errors: errors
        } );
    });
}

var dbgNoteMovePost = require('debug')('noteMovePost');

// handle note move on POST
exports.note_move_post = function(req, res, next) {
    // Move note and redirect to the list of notes.
    async.series({
        // Get note
        srcNote: async function(callback) {
            let srcId = req.body.noteid;
            srcNote = await Note.findById(srcId, callback);
            dbgNoteMovePost('note to move', srcNote);

            // Create note in new location
            var destNote = await new Note({
                title: srcNote.title,
                lectureNote: srcNote.lectureNote,
                creationDate: srcNote.creationDate,
                updateDate: srcNote.updateDate,
                keywords: srcNote.keywords,
                questions: srcNote.questions,
                comments: srcNote.comments,
                summary: srcNote.summary,
                image: srcNote.image,  // to be updated later
                subject: ObjectId(req.body.newsubjectid),
                topic: ObjectId(req.body.newtopicid),
                subtopic: ObjectId(req.body.newsubtopicid),
            });
            require('dotenv').config();
            const cloudinary = require('cloudinary').v2;

            var image_url;
            var cl_error;
            var cl_result;
            var srcFilePath = srcNote.subject._id + '/' + srcNote.topic._id + '/' + srcNote.subtopic._id + '/' + srcNote._id;
            var destDir = req.body.newsubjectid + '/' + req.body.newtopicid + '/' + req.body.newsubtopicid;
            var destFilePath = destDir + '/' + destNote._id;

            dbgNoteMovePost('move contents of cloudinary folder from', srcFilePath + ' to ' + destFilePath);
            // First, search source location for images. This is required as Cloudinary does not currently
            // provide a mechanism for bulk rename of a folder and all contents. Therefore, we get a list of
            // existing image resources and rename each one. Limit to 30 resources.
            await cloudinary.search
            .expression('resource_type:image AND folder:' + srcFilePath)
            .max_results(30)
            .execute().then(result=>cl_result = result)
            .catch(error => cl_error = error);

            var r =  cl_result.resources;
            // for each resource (usually image), rename with new folder
            for (let i = 0; i < r.length; i++) {
                let filename = r[i]['filename'];
                //let format = r[i]['format'];
                //let file = '/' + filename + '.' + format;
                // now create destination folder in cloudinary
                dbgNoteMovePost('rename', filename);
                await cloudinary.uploader.rename(
                    srcFilePath + '/' + filename,
                    destFilePath + '/' + filename,
                {})
                .then(result => cl_result = result)
                .catch(error => cl_error = error);
                if (cl_error) {
                    var error = handle_cloudinary_error(cl_error);
                    render_move_page(req, res, next, [error]);
                    return;
                }
                // Save url for canvas drawing so the new note can use the correct url
                if (filename == 'drawing') {
                    image_url = cl_result.secure_url;
                    dbgNoteMovePost('cloudinary returned url', image_url);
                    // update note with image url
                    destNote.image = image_url;
                }
            }
            // delete source folder which will now be empty
            dbgNoteMovePost('delete folder from cloudinary', srcFilePath);
            await cloudinary.api.delete_folder(srcFilePath, {})
            .then(result => cl_result = result)
            .catch(error => cl_error = error);
            // update note with image url
            if (cl_error) {
                var error = handle_cloudinary_error(cl_error);
                render_move_page(req, res, next, [error]);
                return;
            }
            dbgNoteMovePost('cloudinary response', cl_result);
            // save note
            await destNote.save(function (err) {
                if (err) {
                    console.error('Move note: error saving new note:', err);
                    return next(err);
                }
            });
            // Now delete src note
            dbgNoteMovePost('delete original note from database');
            Note.findByIdAndRemove(srcId, function deleteNote(err) {
                if (err) {
                    console.error('Move note: error removing old note:', err);
                    return next(err);
                }
            });
            // redirect to list of notes for new subject, topic and subtopic
            var redirect = '/' + destDir + '/notes';
            dbgNoteMovePost('redirect to', redirect);
            res.redirect(redirect);
        }
    });
};

var dbgNoteDeleteGet = require('debug')('noteDeleteGet');

// display note delete page on GET.
exports.note_delete_get = function(req, res, next) {
    render_delete_page(req, res, next, null);
};

function render_delete_page(req, res, next, errors) {
    var noteid = req.params.note;
    note_list = null;   // force to null, otherwise still existing from note list get
    dbgNoteDeleteGet('delete subjectid ' + subjectId + ' topicid ' + topicId + ' subtopicid ' + subtopicId + ' noteid ' + noteid);
    async.series({
        note_object: async function (callback) {
            note_object = await Note.findById(noteid, 'title subject topic subtopic creationDate updateDate image', callback);
            dbgNoteDeleteGet('note_object', note_object);
        },
    }, function(err, results) {
        if (err) {
            console.error('Error getting note for delete:', err);
            return next(err);
        }

        note_object.title = decodeEntities(note_object.title);
        dbgNoteDeleteGet('note_object._id', note_object._id);
        res.render('note_delete', {
            title: 'Delete',
            note: note_object,
            subjectid: subjectId,
            subject_list: subjectList,
            topicid: topicId,
            topic_list: topicList,
            subtopicid: subtopicId,
            subtopic_list: subtopicList,
            link_list: linkList,
            errors: errors
        } );
    });
}
var dbgNoteDeletePost = require('debug')('noteDeletePost');

// handle note delete on POST.
exports.note_delete_post = function(req, res, next) {
    // Delete object and redirect to the list of notes.
    dbgNoteDeletePost('delete note', req.body.noteid);
    Note.findByIdAndRemove(req.body.noteid, function deleteNote(err) {
        if (err) { return next(err); }
        (async () => {
            require('dotenv').config();
            const cloudinary = require('cloudinary').v2;
            var cl_error;
            var cl_result;
            var folder = req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid + '/' + req.body.noteid;

            dbgNoteDeletePost('delete contents of cloudinary folder', folder);
            // First, search source location for images. This is required as Cloudinary does not currently
            // provide a mechanism for bulk removal of folder contents. Therefore, we get a list of
            // existing image resources and remove each one. Limit to 30 resources.
            await cloudinary.search
            .expression('resource_type:image AND folder:' + folder)
            .max_results(30)
            .execute().then(result=>cl_result = result)
            .catch(error => cl_error = error);

            var r =  cl_result.resources;
            // remove each resource (usually image)
            for (let i = 0; i < r.length; i++) {
                let filename = r[i]['filename'];
                dbgNoteDeletePost('delete', filename);
                await cloudinary.uploader.destroy(folder + '/' + filename, {})
                .then(result => cl_result = result)
                .catch(error => cl_error = error);
                if (cl_error) {
                    var error = handle_cloudinary_error(cl_error);
                    render_delete_page(req, res, next, [error]);
                    return;
                }
            }
            // delete folder which will now be empty
            dbgNoteDeletePost('delete folder from cloudinary', folder);
            await cloudinary.api.delete_folder(folder, {})
            .then(result => cl_result = result)
            .catch(error => cl_error = error);
            if (cl_error) {
                var error = handle_cloudinary_error(cl_error);
                render_delete_page(req, res, next, [error]);
                return;
            }
            dbgNoteDeletePost('cloudinary response', cl_result);
        })();
        var redirect = '/' + req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid + '/notes';
        dbgNoteDeletePost('redirect to', redirect);
        res.redirect(redirect);
    });
}

var dbgNoteDrawGet = require('debug')('noteDrawGet');

// display drawing page on GET.
exports.note_draw_get = function(req, res, next) {
    render_draw_page(req, res, next, null);
};

function render_draw_page(req, res, next, errors) {
    var noteid = req.params.note;
    note_list = null;   // force to null, otherwise still existing from note list get
    dbgNoteDrawGet('draw noteid', noteid);
    async.series({
        // Get note
        note_object: async function (callback) {
            note_object = await Note.findById(noteid, 'title image', callback);
            dbgNoteDrawGet('note_object', note_object);
        },
    }, function(err, results) {
        if (err) {
            console.error('Error processing draw:', err);
            return next(err);
        }
        res.setHeader('Cache-Control', 'no-cache');
        res.render('note_draw', {
            note: note_object,
            subjectid: subjectId,
            topicid: topicId,
            subtopicid: subtopicId,
            errors: errors
        } );
    });
}
var dbgNoteDrawPost = require('debug')('noteDrawPost');

// handle note drawing on POST.
exports.note_draw_post = function(req, res, next) {
    (async () => {
        var folder = subjectId + '/' + topicId + '/' + subtopicId + '/' + req.params.note;
        require('dotenv').config();
        const cloudinary = require('cloudinary').v2;
        var image_url;
        var cl_error;
        var cl_result;
        dbgNoteDrawPost('send image to cloudinary:', folder);
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
    })();
    var redirect = '/' + req.body.subjectid + '/' + req.body.topicid + '/' + req.body.subtopicid + '/notes';
    dbgNoteDrawPost('redirect to', redirect);
    res.redirect(redirect);
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