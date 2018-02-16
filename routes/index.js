var express = require('express');
var router = express.Router();
var path = require('path');
/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/

router.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname + './../public/admin-index.html'));
})

router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + './../public/views/user/user-index.html'));
})

module.exports = router;
