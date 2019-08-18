const rp = require('request-promise');
const puppeteer = require('puppeteer');
const destiny = require('./destination.js');
const departure = require('./departure.js');
const passengers = require('./passengers.js');
const db = require('./db.js');
const telegramHandler = require('./telegram_handler.js');

const url = 'https://www.google.com/flights';

// TODO on heroku app settings, add https://github.com/jontewks/puppeteer-heroku-buildpack before heroku/nodejs build packs

class Scrapper {
    constructor(params) {
        this.params = params;
    }

    async start() {
        const listOfEntries = db.getAllEntries();

        for (index in listOfEntries) {
            const entry = listOfEntries[index];
            let listCheapestDeparture = await getCheapestDeparture(entry);

            for (var index in listCheapestDeparture) {
                console.log(listCheapestDeparture[index]);
                telegramHandler.sendMessage(entry.chat_id, 'Test message after search')
            }
        }
    }

    async getCheapestDeparture(entry) {
        // use `headless` false to see what the browser is doing
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        // intercept logs in the browser context so we can see in the node server, when we use `evaluate()`
        page.on('console', msg => {
            console.log(msg._text)
        });

        await page.setViewport({ width: 1920, height: 926 });
        await page.goto(url);
        await page.screenshot({ path: 'entry.png' });

        // Setting up passengers
        await passengers.setupPassengers(page, 2, 1);

        // Fill up destiny
        await destiny.fillOriginDestination(page, 'Berlin', 'Ho Chi Minh');

        // Check departure prices
        let cheapestDeparture = await departure.scrapeDeparturePrices(page);

        var list = []
        cheapestDeparture.forEach(element => {
            // console.log(`Date: ${element.date} price: ${element.price}`);
            list.push(`Date: ${element.date} price: ${element.price}`);
        });

        debugger;
        browser.close();

        return list;
    }
}

module.exports = Scrapper;