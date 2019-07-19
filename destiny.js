const destinySelector = '#flt-app > div.gws-flights__flex-column.gws-flights__flex-grow > main.gws-flights__flex-column.gws-flights__active-tab.gws-flights__home-page > div:nth-child(3) > div > div.gws-flights-form__form-card > div > div.gws-flights__flex-box.gws-flights__align-center > div.flt-input.gws-flights-form__input-container.gws-flights__flex-box.gws-flights-form__airport-input.gws-flights-form__empty.gws-flights-form__swapper-left';

async function fillDestiny(page, destiny) {
    console.log('Filling your destiny...')
    await page.focus(destinySelector);
    await page.keyboard.type(destiny)
    await page.screenshot({ path: 'screenshots/destiny.png' });
    await page.keyboard.press('Enter');
    await page.screenshot({ path: 'screenshots/destiny_filled.png' });
}

module.exports = {
	fillDestiny: fillDestiny
};