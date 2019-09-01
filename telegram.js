const express = require('express')

const app = express();
const search = require('./search_router');
const sendResult = require('./send_result_router');
const bodyParser = require('body-parser');
const telegramHandler = require('./telegram_handler.js');
const db = require('./db.js');

if (process.env.NODE_ENV !== 'production') {
    // Initializing local environment
    require('dotenv').config();
}

var port = process.env.SEARCH_REQUEST_PORT || 3000;
// Setting up body parser before the routes
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())

// Endpoint that returns telegram required searchs
app.use('/search', search);
app.use('/send-result', sendResult)


app.listen(port, function() {
    console.log('Telegram server started on port: ' + port);
    telegramHandler.start();
    db.connect();
 });
