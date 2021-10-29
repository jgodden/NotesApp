var express = require('express');
var secured = require('../middleware/secured');
var router = express.Router();

// Require controller modules.
var note_controller = require('../controllers/noteController');

/// NOTE ROUTES ///
router.get( '/logout', note_controller.logout_page);
router.get( '/', note_controller.index_page);

router.get( '/:subject/:topic/:subtopic', secured(), note_controller.note_list);
router.get( '/:subject/:topic/:subtopic/notes', secured(), note_controller.note_list);

router.get( '/:subject/:topic/:subtopic/note/create', secured(), note_controller.note_create_get);
router.post('/:subject/:topic/:subtopic/note/create', note_controller.note_create_post);

router.get( '/:subject/:topic/:subtopic/note/:note', secured(), note_controller.note_update_get);
router.post('/:subject/:topic/:subtopic/note/:note', note_controller.note_update_post);

router.get( '/:subject/:topic/:subtopic/note/:note/move', secured(), note_controller.note_move_get);
router.post('/:subject/:topic/:subtopic/note/:note/move', note_controller.note_move_post);

router.get( '/:subject/:topic/:subtopic/note/:note/delete', secured(), note_controller.note_delete_get);
router.post('/:subject/:topic/:subtopic/note/:note/delete', note_controller.note_delete_post);

router.get( '/:subject/:topic/:subtopic/note/:note/draw', secured(), note_controller.note_draw_get);
router.post('/:subject/:topic/:subtopic/note/:note/draw', note_controller.note_draw_post);

module.exports = router;