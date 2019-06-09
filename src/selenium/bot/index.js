const log = require('../../utils/logger')(module);
const config = require('config');
const {driverChrome, init, findSelectorCssAndCall, callJS, switchTab} = require('../api');

const flows = config.get('emulator.flows');
const newJS = config.get('channelDzen.newJS');

/**
 * Эмулмирует работу на PC
 */
async function emulatorPC() {
	let driver;
	try {
		driver = await driverChrome();
		await init(driver);
		await driver.get('https://zen.yandex.ru/subscriptions?clid=300&country_code=ru');
		await callJS(driver, 'localStorage.clear();');
		await findSelectorCssAndCall(driver, '.onboarding__animation-order-1 > .onboarding__source');
		await findSelectorCssAndCall(driver, '.onboarding__animation-order-2 > .onboarding__source');
		await findSelectorCssAndCall(driver, '.onboarding__animation-order-3 > .onboarding__source');
		await findSelectorCssAndCall(driver, '.onboarding__animation-order-4 > .onboarding__source');
		await findSelectorCssAndCall(driver, '.onboarding__animation-order-5 > .onboarding__source');
		await findSelectorCssAndCall(driver, '.onboarding-bb__next');
		await callJS(driver, 'window.open(\'/id/' + newJS + '\',\'_self\');');
		await callJS(driver, 'localStorage.clear();');
		await switchTab(driver, false);
		// канал
		await findSelectorCssAndCall(driver, '.channel-subscribe');
		//await driver.sleep(2000);
		await findSelectorCssAndCall(driver, '.doc__link');
		// статья
		await switchTab(driver);
		
		for (let i = 1; i < 1500; i += 10) {
			await driver.sleep(300);
			await callJS(driver, 'window.scrollTo(0,' + i + ');');
		}
		/*await driver.findElement(By.css('.button2_view_classic]')).click();
		await driver.findElement(By.css('.article-left-block__icon_type_like]')).click();*/
		//await driver.sleep(10000000);
		await driver.quit();
	} catch (e) {
		log.info('Error emulatorPC -> ' + e);
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
		promise.push(emulatorPC())
	}
	return Promise.all(promise)
}

/**
 * Эмулмирует работу на телефоне
 */
function emulatorAndroid() {

}

module.exports = {
	emulatorPC,
	emulatorStream,
	emulatorAndroid
};