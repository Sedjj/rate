const {log} = require('../../utils/logger');
const config = require('config');
const {
	switchTab,
	driverChrome,
	findTextBySelectorCssAndCall,
	init,
	findSelectorCssAndCall,
	findIdAndFill,
	getCookies,
	findSelectorCssAndFill
} = require('../api');

const flows = config.emulator.flows;

/**
 * Эмулмирует работу на PC
 */
async function performEmulation(ids, totalName) {
	let driver;
	try {
		const param = {
			uLogin: '55311279',
			uPassword: '088706',
		};
		driver = await driverChrome();
		await init(driver);
		await driver.get('https://1xstavka.ru/en/live/');
		await driver.sleep(8000);
		await findSelectorCssAndCall(driver, '.base_auth_form');
		await findIdAndFill(driver, 'auth_id_email', param.uLogin);
		await findIdAndFill(driver, 'auth-form-password', param.uPassword);
		await findSelectorCssAndCall(driver, '.auth-button.auth-button--block');
		await driver.sleep(8000);
		await findSelectorCssAndCall(driver, '.ls-search__button');
		await findSelectorCssAndFill(driver, '.ls-search__input', ids);
		await findSelectorCssAndCall(driver, '.ls-search__button');
		await driver.sleep(5000);
		// await getCookies(driver);
		await findSelectorCssAndCall(driver, '.search-popup-event');
		await driver.sleep(8000);
		await switchTab(driver);
		await findTextBySelectorCssAndCall(driver, '[data-type="9"]', totalName);
		await driver.sleep(2000);
		await findSelectorCssAndFill(driver, '.bet_sum_input', '20');
		await findSelectorCssAndCall(driver, '.coupon-btn-group__item');
		await driver.sleep(10000);
		await driver.quit();
	} catch (e) {
		log.info('Error performEmulation -> ' + e);
		await driver.quit();
	}
}

/**
 * Запускает эмуляцию в потоке.
 *
 * @returns {Promise<[any]>}
 */
function emulatorStream() {
	const promise = [];
	for (let i = 0; i < flows; i++) {
		promise.push(performEmulation());
	}
	return Promise.all(promise);
}

module.exports = {
	performEmulation,
	emulatorStream
};