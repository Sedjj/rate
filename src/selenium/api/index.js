const chrome = require('selenium-webdriver/chrome');
const config = require('config');
const log = require('../../utils/logger')(module);
const {By, Key, until} = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const chromedriver = require('chromedriver');
const {randomInteger} = require('./../utils/randomHelper');
const {languages} = require('../../data/strict-languages');
const {userAgent} = require('../../data/user-agent');
const {workingProxy} = require('../proxyApi');

chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
const argument = config.get('chrome.options.arguments');

/**
 * Создаем инстанс для хрома.
 *
 * @returns {Promise<*>}
 * @constructor
 */
async function driverChrome() {
	return await new webdriver.Builder()
		.withCapabilities(webdriver.Capabilities.chrome())
		.setChromeOptions(await emulatorOfUniqueness())
		.build();
}

/**
 * Настройки браузера.
 *
 * @param {object} driver инстанс драйвера
 * @returns {Promise<void>}
 */
async function init(driver) {
	return await driver.manage().window().setSize(randomInteger(600, 1024), randomInteger(300, 768));
}

/**
 * Подмена отпечатка браузера.
 *
 * @returns {Promise<chrome.Options>}
 */
async function emulatorOfUniqueness() {
	const options = new chrome.Options();
	options.addArguments('user-agent=' + userAgent[randomInteger(0, 7)]);
	options.addArguments('lang=' + languages[randomInteger(0, 101)]);
	let proxy;
	if ((proxy = await workingProxy())) {
		log.info('**** proxy: ' + proxy.protocol + '://' + proxy.ip + ':' + proxy.port);
		options.addArguments('proxy-server=' + proxy.ip + ':' + proxy.port);
	}
	argument.forEach((item) => {
		options.addArguments(item);
	});
	return options;
}

/**
 * Функция для поиска элемента по селектору css и вызова click.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} selector
 * @returns {Promise<void>}
 */
async function findSelectorCssAndCall(driver, selector) {
	return await driver.findElement(By.css(selector)).click();
}

/**
 * Вызов стороннего скрипта.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} script
 * @returns {Promise<void>}
 */
async function callJS(driver, script) {
	return await driver.executeScript(script);
}

/**
 * Переключение квладок.
 *
 * @param {object} driver инстанс драйвера
 * @param {boolean} closed флаг для определения нужно ли закрыть предыдущую вкладку
 * @returns {Promise<*>}
 */
async function switchTab(driver, closed = true) {
	return await driver.getAllWindowHandles()
		.then(handles => {
			const nextTab = (handles.length > 1);
			if (nextTab) {
				closed && driver.close();
				driver.switchTo().window(handles[1]);
			}
			return nextTab;
		});
}

module.exports = {
	driverChrome,
	init,
	findSelectorCssAndCall,
	callJS,
	switchTab
};