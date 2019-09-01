const telegramHandler = require('./telegram_handler.js');

function sendResult(req, res, next) {
    console.log('receiving result', req.body)

    var searchId = req.body.id;
    var result = req.body.result;

    console.log('searchId', req.body.id)
    console.log('result', req.body.result)

    res.send({})
    telegramHandler.sendMessage(searchId, result)
}

module.exports = {
	sendResult: sendResult
};