const schedule = require('node-schedule');
const Scrapper = require('./scrapper');

// runs every 5 minutes
// schedule.scheduleJob('* 8,12,17,22 * * *', function(){
schedule.scheduleJob('*/30 * * * *', function(){
    console.log('Scrapper running');

    const scrapper = new Scrapper();
    scrapper.start();
});