const destinationSelector = '#flt-app > div.gws-flights__flex-column.gws-flights__flex-grow > main.gws-flights__flex-column.gws-flights__active-tab.gws-flights__home-page > div:nth-child(3) > div > div.gws-flights-form__form-card > div > div.gws-flights__flex-box.gws-flights__align-center > div.flt-input.gws-flights-form__input-container.gws-flights__flex-box.gws-flights-form__airport-input.gws-flights-form__empty.gws-flights-form__swapper-left';
const originSelector = '#flt-app > div.gws-flights__flex-column.gws-flights__flex-grow > main.gws-flights__flex-column.gws-flights__active-tab.gws-flights__home-page > div:nth-child(3) > div > div.gws-flights-form__form-card > div > div.gws-flights__flex-box.gws-flights__align-center > div.flt-input.gws-flights-form__input-container.gws-flights__flex-box.gws-flights-form__airport-input.gws-flights-form__swapper-right > span.gws-flights-form__location-icon.gws-flights-form__origin-icon > span > svg';
const fromToInputSelector = '#sb_ifc50 > input[type=text]'

async function fillOriginDestination(page, origin, destination) {
    console.log(`Filling flight from ${origin} to ${destination}`)

    await fillInputField(page, origin, originSelector)
    await fillInputField(page, destination, destinationSelector)
}

// I've no idea but i can only input those fucking fields
// if i take a screenshot, i'm open to suggestions
async function fillInputField(page, text, fieldSelector) {
    await page.tap(fieldSelector)
    await page.focus(fromToInputSelector)
    await page.keyboard.type(text)
    await page.screenshot({ path: 'screenshots/input.png' });
    await page.keyboard.press('Tab');
}

module.exports = {
    fillOriginDestination: fillOriginDestination
};