const rp = require('request-promise');
const puppeteer = require('puppeteer');
const destiny = require('./destiny.js');
const departure = require('./departure.js');

const url = 'https://www.google.com/flights';

(async () => {
    // use `headless` false to see what the browser is doing
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // intercept logs in the browser context so we can see in the node server, when we use `evaluate()`
    page.on('console', msg => {
        console.log(msg._text)
    });
    
    await page.setViewport({ width: 1920, height: 926 });
    await page.goto(url);
    await page.screenshot({ path: 'screenshots/entry.png' });
    
    // Fill up destiny
    await destiny.fillDestiny(page, 'São Paulo')
    
    // Check departure prices
    let cheapestDeparture = await departure.scrapeDeparturePrices(page);

    cheapestDeparture.forEach(element => {
        console.log(`Date: ${element.date} price: ${element.price}`)
    });
    
    debugger;
    browser.close();
})();