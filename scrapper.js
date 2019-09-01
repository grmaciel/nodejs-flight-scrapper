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
            this.retriveDepartures(result);

            // result.forEach(search => {
            //     this.getCheapestDeparture(search)
            //         .then(results => {
            //             let resultText = `${search.departure} -> ${search.destination} - Results: ${results.join()}`
            //             this.sendSearchResults(search.id, resultText)
            //         })
            // })
        })
    }

    // Running one query at a time for now
    async retriveDepartures(results) {
        for (var i = 0; i < results.length; i++) {
            let search = results[i];
            console.log('Querying info for ', search);
            let result = await this.getCheapestDeparture(search);
            let resultText = `${search.departure} -> ${search.destination} - Results: ${result.join()}`
            this.sendSearchResults(search.id, resultText)
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
        await page.goto(url, { timeout: 0 });
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
                'result': results
            }
        }, (err, res, body) => {
            console.log('err ', err)
            console.log('response code', res.statusCode)
        })
        console.log('Sending Search results ' + results)
    }
}

module.exports = Scrapper;