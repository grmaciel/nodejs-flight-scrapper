var express = require('express');
var router = express.Router();
var controller = require('./send_result_controller')

router.post('/', controller.sendResult)

module.exports = router;