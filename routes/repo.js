var express = require('express');
var router = express.Router();

// Require controller modules.
var note_controller = require('../controllers/noteController');

/// NOTE ROUTES ///

/* GET home page. */
router.get('/', note_controller.home_page);

router.get( '/:subject/:topic/:subtopic', note_controller.note_list);
router.get( '/:subject/:topic/:subtopic/notes', note_controller.note_list);

router.get( '/:subject/:topic/:subtopic/note/create', note_controller.note_create_get);
router.post('/:subject/:topic/:subtopic/note/create', note_controller.note_create_post);

router.get( '/:subject/:topic/:subtopic/note/:note', note_controller.note_update_get);
router.post('/:subject/:topic/:subtopic/note/:note', note_controller.note_update_post);

router.get( '/:subject/:topic/:subtopic/note/:note/move', note_controller.note_move_get);
router.post('/:subject/:topic/:subtopic/note/:note/move', note_controller.note_move_post);

router.get( '/:subject/:topic/:subtopic/note/:note/delete', note_controller.note_delete_get);
router.post('/:subject/:topic/:subtopic/note/:note/delete', note_controller.note_delete_post);

router.get( '/:subject/:topic/:subtopic/note/:note/draw', note_controller.note_draw_get);
router.post('/:subject/:topic/:subtopic/note/:note/draw', note_controller.note_draw_post);

module.exports = router;