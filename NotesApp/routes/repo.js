var express = require('express');
var router = express.Router();

// Require controller modules.
var note_controller = require('../controllers/noteController');

//var run = require('../public/javascripts/script');
/// NOTE ROUTES ///

// GET repo home page.
router.get('/:subject', note_controller.note_list);

// GET request for creating a Note. NOTE This must come before routes that display Note (uses id).
router.get('/:subject/note/create', note_controller.note_create_get);

// POST request for creating Note.
router.post('/:subject/note/create', note_controller.note_create_post);

// GET request to delete Note.
router.get('/:subject/note/:note/delete', note_controller.note_delete_get);

// POST request to delete Note.
router.post('/:subject/note/:note/delete', note_controller.note_delete_post);

// GET request to update Note.
router.get('/:subject/note/:note', note_controller.note_update_get);

// POST request to update Note.
router.post('/:subject/note/:note', note_controller.note_update_post);

// GET request for list of all Note items.
router.get('/:subject/notes', note_controller.note_list);


module.exports = router;