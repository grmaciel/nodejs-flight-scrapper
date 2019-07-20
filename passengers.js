const passengerButtonSelector = '#flt-pax-button';
const passengerPlusSelector = '#flt-modaldialog > div > div > div:nth-child(1) > div > div:nth-child(3) > div.gws-flights-widgets-numberpicker__flipper-shadow'
const childrenPlusSelector = '#flt-modaldialog > div > div > div:nth-child(2) > div > div:nth-child(3) > div.gws-flights-widgets-numberpicker__flipper-shadow'
const doneSelector = '#flt-modaldialog > div > div > div.gws-flights__dialog-button-container.oMol8b > div.gws-flights__dialog-button.gws-flights__dialog-primary-button'

async function setupPassenger(page, adults, children, infantsInSeat, infantsOnLap) {
    if (adults == 1 && children == 0 && infantsInSeat == 0 && infantsOnLap == 0) return;

    console.log(`Settings passangers: adults: ${adults} children: ${children}`);

    await page.click(passengerButtonSelector);
    await page.waitFor(passengerPlusSelector);
    
    // there's always 1 adult set up
    for (i = 1; i < adults; i++) {
        await clickAndWait(page, passengerPlusSelector)
    }

    for (i = 0; i < children; i++) {
        await clickAndWait(page, childrenPlusSelector)
    }

    // we need to wait before clicking apparently
    await clickAndWait(page, doneSelector)
    await page.waitFor(1000);
    // TODO: add validation that the Passenger count in the label is equal the number of passengers
}

async function clickAndWait(page, selector) {
    await page.waitFor(500);
    await page.click(selector)
}

module.exports = {
    setupPassenger: setupPassenger
};