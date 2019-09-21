const chrome = require('selenium-webdriver/chrome');
const config = require('config');
const path = require('path');
const {log} = require('../../utils/logger');
const {By, until, Builder, Capabilities} = require('selenium-webdriver');
const {sendFile} = require('../../telegram/api');
const {readFileToStream, saveBufferToFile} = require('../../utils/fsHelpers');
const {path: pathChrome} = require('chromedriver');

chrome.setDefaultService(new chrome.ServiceBuilder(pathChrome).build());
const storagePath = config.path.storagePath || process.cwd();
const uploadDirectory = config.path.directory.upload || 'upload';

const speed = {
	veryFast: 500,
	fast: 1000,
	normal: 10000,
	slow: 20 * 1000,
	verySlow: 40 * 1000,
};

/**
 * Создаем инстанс для хрома.
 *
 * @returns {Promise<*>}
 * @constructor
 */
async function driverChrome() {
	try {
		if (process.env.NODE_ENV === 'development') {
			log.info('driverChrome development');
			return await new Builder()
				.withCapabilities(Capabilities.chrome())
				.setChromeOptions(await emulatorOfUniqueness())
				.build();
		} else {
			log.info('driverChrome production');
			return await new Builder()
				.forBrowser('chrome')
				.usingServer('http://hub:4444/wd/hub').build();
		}
	} catch (e) {
		log.error(`Error driverChrome ->  ${e}`);
		throw new Error('Can`t connect driver');
	}
}

/**
 * Настройки браузера.
 *
 * @param {object} driver инстанс драйвера
 * @returns {Promise<void>}
 */
async function init(driver) {
	try {
		await driver.manage().window().setRect({width: 1600, height: 1200});
	} catch (e) {
		throw new Error('Can`t init driver');
	}
}

/**
 * Подмена отпечатка браузера.
 *
 * @returns {Promise<chrome.Options>}
 */
async function emulatorOfUniqueness() {
	const options = new chrome.Options();
	options.addArguments('headless');
	options.addArguments('no-sandbox');
	options.addArguments('incognito');
	options.addArguments('test-type');
	options.addArguments('disable-webgl');
	options.addArguments('window-size=1600,1200');
	options.addArguments('disable-gpu');
	options.addArguments('disable-webgl-image-chromium');
	return options;
}

/**
 * Функция для поиска элемента по селектору.
 *
 * @param {object} driver инстанс драйвера
 * @param {!By} selector
 * @returns {Promise<HTMLInputElement | boolean>}
 */
async function findSelector(driver, selector) {
	try {
		let element = await driver.wait(
			until.elementLocated(selector),
			speed.verySlow
		);
		element = await driver.wait(
			until.elementIsVisible(element),
			speed.slow
		);
		if (element) {
			return element;
		} else {
			log.debug(`Item not found in ${speed.verySlow}ms, selector - ${selector}`);
			return false;
		}
	} catch (e) {
		return false;
	}
}

/**
 * Функция для поиска элемента по селектору css.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} selector css селектор
 * @returns {Promise<boolean>}
 */
async function findSelectorCss(driver, selector) {
	try {
		const el = await findSelector(driver, By.css(selector));
		return !!el;
	} catch (e) {
		return false;
	}
}

/**
 * Функция для проверки по css selector, еслить ли элемент на странице.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} selector css селектор
 * @returns {Promise<boolean>}
 */
async function isElementByCss(driver, selector) {
	try {
		const el = await driver.findElement(By.css(selector));
		return !!el;
	} catch (e) {
		return false;
	}
}

/**
 * Функция для проверки по id, еслить ли элемент на странице.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} selector css селектор
 * @returns {Promise<boolean>}
 */
async function isElementById(driver, selector) {
	try {
		const el = await driver.findElement(By.id(selector));
		return !!el;
	} catch (e) {
		return false;
	}
}

/**
 * Функция для поиска элемента на странице по id.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} selector css селектор
 * @returns {Promise<boolean>}
 */
async function findById(driver, selector) {
	try {
		const el = await findSelector(driver, By.id(selector));
		return !!el;
	} catch (e) {
		return false;
	}
}

/**
 * Функция для поиска элемента по селектору css и вызова click.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} selector css селектор
 * @returns {Promise<boolean>}
 */
async function findCssAndCall(driver, selector) {
	try {
		const el = await findSelector(driver, By.css(selector));
		if (el) {
			await el.click();
			return true;
		} else {
			return false;
		}
	} catch (e) {
		log.error(`Error findCssAndCall selector - ${selector} -> ${e}`);
		return false;
	}
}

/**
 * Функция для поиска элемента по id и вызова click.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} selector css селектор
 * @returns {Promise<boolean>}
 */
async function findIdAndCall(driver, selector) {
	try {
		const el = await findSelector(driver, By.id(selector));
		if (el) {
			await el.click();
			return true;
		} else {
			return false;
		}
	} catch (e) {
		log.error(`Error findIdAndCall selector - ${selector} -> ${e}`);
		return false;
	}
}

/**
 * Функция для поиска элемента по id и заполнение формы.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} selector поиска
 * @param {String} text текст заполнения
 * @returns {Promise<boolean>}
 */
async function findIdAndFill(driver, selector, text) {
	try {
		const el = await findSelector(driver, By.id(selector));
		if (el) {
			await write(el, text);
			return true;
		} else {
			return false;
		}
	} catch (e) {
		log.error(`Error findIdAndFill selector - ${selector} -> ${e}`);
		return false;
	}
}

/**
 * Функция для поиска элемента по селектору css и заполнение формы.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} selector поиска
 * @param {String} text текст заполнения
 * @returns {Promise<boolean>}
 */
async function findSelectorCssAndFill(driver, selector, text) {
	try {
		const el = await findSelector(driver, By.css(selector));
		if (el) {
			await write(el, text);
			return true;
		} else {
			return false;
		}
	} catch (e) {
		log.error(`Error findSelectorCssAndFill selector - ${selector} -> ${e}`);
		return false;
	}
}

/**
 * Функция для поиска элемента по содержимому селектора css и вызова click.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} selector поиска
 * @param {String} value текст заполнения
 * @returns {Promise<boolean>}
 */
async function findTextBySelectorCssAndCall(driver, selector, value) {
	try {
		const items = await driver.findElements(By.css(selector));
		if (items && items.length > 0) {
			return Promise.resolve(await items.reduce(async (acc, item) => {
				const text = await item.getText();
				if (text.indexOf(value) !== -1) {
					item.click();
					acc = true;
				}
				return acc;
			}, false));
		} else {
			return false;
		}
	} catch (e) {
		log.error(`Error findTextBySelectorCssAndCall selector - ${selector} -> ${e}`);
		return false;
	}
}

/**
 * Вызов стороннего скрипта.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} script
 * @returns {Promise<boolean>}
 */
async function callJS(driver, script) {
	try {
		await driver.executeScript(script);
		return true;
	} catch (e) {
		log.error(`Error callJS script - ${script} -> ${e}`);
		return false;
	}
}

/**
 * Заполнить элементы ввода
 * @param {HTMLInputElement} el элемент дя заполнения
 * @param {String} text текст заполнения
 * @returns {Promise<boolean>}
 */
async function write(el, text) {
	try {
		const value = await el.getText();
		if (value === '') {
			await el.sendKeys(text);
		}
		return true;
	} catch (e) {
		log.error(`Error write text - ${text} -> ${e}`);
		return false;
	}
}

/**
 * Получение cookies авторизованного пользователя.
 *
 * @param {object} driver инстанс драйвера
 * @returns {Promise<void>}
 */
async function getCookies(driver) {
	await driver.manage().getCookies().then(function (cookies) {
		log.info(cookies);
	});
}

/**
 * Переключение квладок.
 *
 * @param {object} driver инстанс драйвера
 * @param {boolean} closed флаг для определения нужно ли закрыть предыдущую вкладку
 * @returns {Promise<boolean>}
 */
async function switchTab(driver, closed = true) {
	try {
		const handles = await driver.getAllWindowHandles();
		if (handles.length > 1) {
			closed && await driver.close();
			await driver.switchTo().window(handles[1]);
			await driver.sleep(speed.normal);
			try {
				await driver.wait(
					() => driver.executeScript('return document.readyState')
						.then((readyState) => {
							return readyState === 'complete';
						}),
					speed.verySlow
				);
			} catch (e) {
				log.error('Error document.readyState -> ' + e);
			}
			return true;
		} else {
			return false;
		}
	} catch (e) {
		log.error('Error switchTab -> ' + e);
		return false;
	}
}

/**
 * Создание скриншота выполнения.
 *
 * @param {object} driver инстанс драйвера
 * @param {String} nameFile имя выходного файла
 * @returns {Promise<boolean>}
 */
async function screenShot(driver, nameFile) {
	try {
		const base64Image = await driver.takeScreenshot(true);
		const decodedImage = new Buffer.from(base64Image, 'base64');
		const filePath = await saveBufferToFile(path.join(storagePath, uploadDirectory, nameFile), decodedImage);
		if (process.env.NODE_ENV !== 'development') {
			const stream = await readFileToStream(filePath);
			await sendFile(stream);
		}
		await driver.sleep(speed.veryFast);
		return true;
	} catch (e) {
		log.error('Error screenShot -> ' + e);
		return false;
	}
}

module.exports = {
	driverChrome,
	init,
	findSelectorCss,
	isElementByCss,
	isElementById,
	findById,
	findCssAndCall,
	findIdAndCall,
	findIdAndFill,
	findSelectorCssAndFill,
	findTextBySelectorCssAndCall,
	callJS,
	write,
	switchTab,
	getCookies,
	screenShot
};