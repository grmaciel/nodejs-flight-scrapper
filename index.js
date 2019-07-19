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
    // TODO: this might not work if the city have 2 airports i guess, not sure though
    await destiny.fillDestiny(page, 'Navegantes')
    
    // Check departure prices
    let cheapestDeparture = await departure.scrapeDeparturePrices(page);

    cheapestDeparture.forEach(element => {
        console.log('cheapest prices: ' + element.price);    
        console.log('cheapest date: ' + element.date);    
    });
    
    debugger;
    browser.close();
})();