var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/repo/6128b8a7fcd1382b28f4ecba/notes');
});

module.exports = router;
