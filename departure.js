const departureDateSelector = '#flt-app > div.gws-flights__flex-column.gws-flights__flex-grow > main.gws-flights__flex-column.gws-flights__active-tab.gws-flights__home-page > div:nth-child(3) > div > div.gws-flights-form__form-card > div > div.gws-flights__flex-box.gws-flights__align-center > div.gws-flights-form__input-container.gws-flights__flex-box.gws-flights__flex-filler.gws-flights-form__calendar-input.flt-body2 > div.flt-input.gws-flights__flex-box.gws-flights__flex-filler.gws-flights-form__departure-input.gws-flights-form__round-trip'
const calendarSelector = '#flt-modaldialog > div > two-month-calendar'
const nextMonthBtnSelector = '#flt-modaldialog > div > two-month-calendar > div > calendar-flippers > div.gws-travel-calendar__flipper.gws-travel-calendar__next'
const waitForRequests = require('./waitForRequests.js');

async function scrapeDeparturePrices(page) {
    await page.click(departureDateSelector)
    await page.waitForSelector(calendarSelector)

    // funky waiting for the first prices to load, could use the wait for requests now
    await page.waitFor(3000);

    return await findCheapestPricesInOneYear(page);
}

async function findCheapestPricesInOneYear(page) {
    var cheapestPrices = [];
    await page.setRequestInterception(true);


    // we always have 2 visible months, so we just jump to the next two
    for (i = 0; i < 12; i += 2) {
        // all the months are available here but we still need to trigger the load of the prices
        let departure = await cheapestPriceInVisibleMonths(page, i, i + 1);

        if (departure) {
            cheapestPrices.push(departure);
        }

        // we need to move 2 months ahead
        await page.click(nextMonthBtnSelector)
        await page.waitFor(1000);
        await page.click(nextMonthBtnSelector)
        await page.waitFor(1000);
        try {
            await waitForRequests.waitForRequests(page).catch(e => { });
        } catch (error) {
            //we don't care really
        }
    }

    let cheapestDeparture = cheapestPrices.reduce((previousDeparture, currentDeparture) =>
        previousDeparture.price < currentDeparture.price ? previousDeparture : currentDeparture);

    return cheapestPrices.filter(departure =>
        isPriceInAcceptedVariation(cheapestDeparture.price, departure.price)
    )
}

function isPriceInAcceptedVariation(cheapestPrice, currentPrice) {
    // 10% margin on prices from the cheapest price we had to add some options
    let acceptedPriceVariation = .1;
    let maxAcceptedPrice = cheapestPrice + cheapestPrice * acceptedPriceVariation

    return currentPrice == cheapestPrice || currentPrice <= maxAcceptedPrice
}

async function cheapestPriceInVisibleMonths(page, firstMonthIndex, secondMonthIndex) {
    console.log('checking cheapest price')
    return await page.evaluate((firstMonthIndex, secondMonthIndex) => {
        const months = document.getElementsByClassName('gws-travel-calendar__month gws-travel-calendar__show-annotations')
        const weekSelector = 'gws-travel-calendar__week';

        let firstMonthHtmlElement = months[firstMonthIndex];
        let secondMonthHtmlElement = months[secondMonthIndex];

        if (!firstMonthHtmlElement || !secondMonthHtmlElement) {
            return;
        }

        let firstMonthName = firstMonthHtmlElement.children[0].innerText;
        let secondMonthName = secondMonthHtmlElement.children[0].innerText;
        console.log(`Checking departure for months: ${firstMonthName} and ${secondMonthName}`)

        let firstMonth = Array.prototype.slice.apply(months[firstMonthIndex].getElementsByClassName(weekSelector))
        let secondMonth = Array.prototype.slice.apply(months[secondMonthIndex].getElementsByClassName(weekSelector))
        var weeks = firstMonth.concat(secondMonth);

        var cheapestPrice = 999999999999.0;
        var date = ''

        for (var index in weeks) {
            const week = weeks[index];
            const days = week.children;
            for (dayIndex in days) {
                const day = days[dayIndex];
                if (!day || !day.className || day.className.includes('disabled')) {
                    continue;
                }
                const priceAndDay = day.innerText.split('\n')

                if (priceAndDay[1]) {
                    // if the browser is not headless the date parsing is a bit different
                    // let price = Number(priceAndDay[1].replace(',', '.'))
                    let price = Number(priceAndDay[1].replace(/[^\d+]/g, ''));
                    /**
                     * debug purpose to verify if we are really seeing the prices for the full month
                     * can't guarantee this 100% with the current implementation
                     */
                    // console.log('price ' + price + ' for day ' + day.getAttribute('data-day'));

                    if (price < cheapestPrice) {
                        cheapestPrice = price;
                        date = day.getAttribute('data-day')
                    }
                }
            }
        }

        return { 'price': cheapestPrice, 'date': date };
    }, firstMonthIndex, secondMonthIndex)
}

module.exports = {
    scrapeDeparturePrices: scrapeDeparturePrices
};
