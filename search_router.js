var express = require('express');
var router = express.Router();
var controller = require('./search_controller')

router.get('/', controller.search)

module.exports = router;