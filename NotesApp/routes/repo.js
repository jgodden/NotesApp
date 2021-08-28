var express = require('express');
var router = express.Router();

// Require controller modules.
var note_controller = require('../controllers/noteController');
var subject_controller = require('../controllers/subjectController');

/// NOTE ROUTES ///

// GET repo home page.
router.get('/', note_controller.index);

// GET request for creating a Note. NOTE This must come before routes that display Note (uses id).
router.get('/note/create', note_controller.note_create_get);

// POST request for creating Note.
router.post('/note/create', note_controller.note_create_post);

// GET request to delete Note.
router.get('/note/:id/delete', note_controller.note_delete_get);

// POST request to delete Note.
router.post('/note/:id/delete', note_controller.note_delete_post);

// GET request to update Note.
router.get('/note/:id/update', note_controller.note_update_get);

// POST request to update Note.
router.post('/note/:id/update', note_controller.note_update_post);

// GET request for one Note.
router.get('/note/:id', note_controller.note_detail);

// GET request for list of all Note items.
router.get('/notes', note_controller.note_list);

/// SUBJECT ROUTES ///

// GET request for creating Subject. NOTE This must come before route for id (i.e. display subject).
router.get('/subject/create', subject_controller.subject_create_get);

// POST request for creating Subject.
router.post('/subject/create', subject_controller.subject_create_post);

// GET request to delete Subject.
router.get('/subject/:id/delete', subject_controller.subject_delete_get);

// POST request to delete Subject.
router.post('/subject/:id/delete', subject_controller.subject_delete_post);

// GET request to update Subject.
router.get('/subject/:id/update', subject_controller.subject_update_get);

// POST request to update Subject.
router.post('/subject/:id/update', subject_controller.subject_update_post);

// GET request for one Subject.
router.get('/subject/:id', subject_controller.subject_detail);

// GET request for list of all Subjects.
router.get('/subjects', subject_controller.subject_list);

module.exports = router;