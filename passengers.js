const passengerButtonSelector = '#flt-pax-button';
const passengerPlusSelector = '#flt-modaldialog > div > div > div:nth-child(1) > div > div:nth-child(3) > div.gws-flights-widgets-numberpicker__flipper-shadow'
const childrenPlusSelector = '#flt-modaldialog > div > div > div:nth-child(2) > div > div:nth-child(3) > div.gws-flights-widgets-numberpicker__flipper-shadow'
const doneSelector = '#flt-modaldialog > div > div > div.gws-flights__dialog-button-container.oMol8b > div.gws-flights__dialog-button.gws-flights__dialog-primary-button'
const numberOfAdultPassengersSelector = '#flt-modaldialog > div > div > div:nth-child(1) > div > div.gws-flights-widgets-numberpicker__flipper-value.flt-body2'

// Apparently this can get flaky on first runs, even though checking the screenshots
// the number of passengers are there
async function setupPassengers(page, adults, children) {
    if (adults == 1 && children == 0) return;

    console.log(`Settings passengers: adults: ${adults} children: ${children}`);

    await clickAndWait(page, passengerButtonSelector)

    // there's always 1 adult set up
    for (i = 1; i < adults; i++) {
        await clickAndWait(page, passengerPlusSelector)
    }

    // validate number of adults
    await page.waitFor(1000);
    let numberOfAdults = await fieldValue(page, numberOfAdultPassengersSelector)

    while (numberOfAdults != adults) {
        console.log('settings number of adults again, previously: ' + numberOfAdults + ' needed: ' + adults)

        for (i = numberOfAdults; i < adults; i++) {
            await clickAndWait(page, passengerPlusSelector)
        }

        numberOfAdulnumberOfAdultstPassengersSelector = await fieldValue(page, numberOfAdultPassengersSelector)
    }

    for (i = 0; i < children; i++) {
        await clickAndWait(page, childrenPlusSelector)
    }

    // we need to wait before clicking apparently
    await page.waitFor(1000);
    await clickAndWait(page, doneSelector)

    await page.waitFor(2000);
    // await page.screenshot({ path: 'screenshots/passengers_finished.png' });
    // TODO: add support to infants
}

async function clickAndWait(page, selector) {
    await page.waitFor(2000);
    await page.click(selector)
}

async function fieldValue(page, selector) {
    return page.evaluate((selector) => {
        return document.querySelector(selector).textContent
    }, selector)
}

module.exports = {
    setupPassengers: setupPassengers
};