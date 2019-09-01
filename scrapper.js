const rp = require('request-promise');
const puppeteer = require('puppeteer');
const destiny = require('./destination.js');
const departure = require('./departure.js');
const passengers = require('./passengers.js');
const request = require('request');

const url = 'https://www.google.com/flights';


// TODO on heroku app settings, add https://github.com/jontewks/puppeteer-heroku-buildpack before heroku/nodejs build packs

if (process.env.NODE_ENV !== 'production') {
    // Initializing local environment
    require('dotenv').config();
}

const searchServerUrl = `${process.env.SEARCH_REQUEST_HOST}:${process.env.SEARCH_REQUEST_PORT}`;

class Scrapper {
    async start() {
        this.retrievePendingSearchRequests((result) => {
            result.forEach(search => {
                console.log('executing search ', search)
                this.getCheapestDeparture(search)
                    .then(results => this.sendSearchResults(search.id, results))

            })
        })
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
        await destiny.fillOriginDestination(page, entry.departure, entry.destination);

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

    retrievePendingSearchRequests(resultCallback) {
        request(`${searchServerUrl}/search`, (err, res, body) => {
            let searchItems = JSON.parse(body)

            resultCallback(searchItems)
        })
    }

    sendSearchResults(id, results) {
        request.post(`${searchServerUrl}/send-result`, {
            json: {
                'id': id,
                'result': results.join()
            }
        }, (err, res, body) => {
            console.log('err ', err)
            console.log('response code', res.statusCode)
        })
        console.log('Sending Search results ' + results)
    }
}

new Scrapper().start();
module.exports = Scrapper;