var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  if (res.locals.user)
    res.render('note_list', { title: 'notes' });
  else
    res.render('index', { title: 'notes' });
});

module.exports = router;