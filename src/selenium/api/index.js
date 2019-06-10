const chrome = require('selenium-webdriver/chrome');
const config = require('config');
const {By} = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const chromedriver = require('chromedriver');

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
	return await driver.manage().window().setRect({width: 1400, height: 1000});
}

/**
 * Подмена отпечатка браузера.
 *
 * @returns {Promise<chrome.Options>}
 */
async function emulatorOfUniqueness() {
	const options = new chrome.Options();
	options.addArguments('headless');
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
 * Функция для поиска элемента по id и заполнение формы.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} selector поиска
 * @param {String} text текст заполнения
 * @returns {Promise<void>}
 */
async function findIdAndFill(driver, selector, text) {
	const el = await driver.findElement(By.id(selector));
	await write(el, text);
	return Promise.resolve();
}

/**
 * Функция для поиска элемента по селектору css и заполнение формы.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} selector поиска
 * @param {String} text текст заполнения
 * @returns {Promise<void>}
 */
async function findSelectorCssAndFill(driver, selector, text) {
	const el = await driver.findElement(By.css(selector));
	await write(el, text);
	return Promise.resolve();
}

/**
 * Функция для поиска элемента по содержимому селектора css и вызова click.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} selector поиска
 * @param {String} value текст заполнения
 * @returns {Promise<void>}
 */
async function findTextBySelectorCssAndCall(driver, selector, value) {
	const items = await driver.findElements(By.css(selector));
	await items.reduce(async (acc, item) => {
		const text = await item.getText();
		if (text.indexOf(value) !== -1) {
			item.click();
		}
		return acc;
	}, Promise.resolve());
	return Promise.resolve();
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
 * Заполнить элементы ввода
 * @param {HTMLInputElement} el элемент дя заполнения
 * @param {String} text текст заполнения
 * @returns {Promise<void>}
 */
async function write(el, text) {
	return await el.sendKeys(text);
}

/**
 * Получение cookies авторизованного пользователя.
 *
 * @param {object} driver инстанс драйвера
 * @returns {Promise<void>}
 */
async function getCookies(driver) {
	await driver.manage().getCookies().then(function (cookies) {
		console.log(cookies);
	});
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
	findIdAndFill,
	findSelectorCssAndFill,
	findTextBySelectorCssAndCall,
	callJS,
	write,
	switchTab,
	getCookies
};