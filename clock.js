const schedule = require('node-schedule');
const Scrapper = require('./scrapper');

// Example of crontab which probably we'll use later '* 8,12,17,22 * * *', it will run at 8h, 12, 17h and 22h
var crontab = process.env.CRONTAB
if (crontab == null) {
    // define default schedule to every 30 min
    crontab = '* * * * *'
}

schedule.scheduleJob(crontab, function() {
    console.log('Scrapper running ', Date().toString());

    const scrapper = new Scrapper();
    scrapper.start();
});