const {log} = require('../../utils/logger');
const config = require('config');
const {sendMessageSupport} = require('../../telegram/api');
const {decorateMessageWaitingPhone, decorateMessageWaitingCode, decorateMessageVerification} = require('../../utils/formateMessage');
const {rateStatus, rateAmount, authPhone} = require('../../store');
const {
	switchTab,
	driverChrome,
	findSelectorCss,
	findTextBySelectorCssAndCall,
	init,
	findCssAndCall,
	screenShot,
	isElementByCss,
	findIdAndFill,
	findIdAndCall,
	findById,
	findSelectorCssAndFill
} = require('../api');

const speed = {
	veryFast: 500,
	fast: 1000,
	normal: 10000,
	slow: 20 * 1000,
	verySlow: 40 * 1000,
	waitingForCode: 120 * 1000,
};

/**
 * Массив интервалов в миллисекундах после которых делается попытка поиска элемента
 */
const searchTimeouts = [2000, 5000, 8000, 12000, 15000, 1];

const auth = config.auth;
const nameBot = config.bots.prod.name;
const active = config.parser.active;
const urlStartPage = config.parser[`${active[0]}`]['startPage'];

/**
 * Эмулмирует работу на PC.
 *
 * @param {Number} ids идентификатор матча
 * @param {Number} numberColumn номер столбца тотала
 * @param {String} totalName искомая ставка
 * @returns {Promise<void>}
 */
async function performEmulation(ids, numberColumn, totalName) {
	if (!rateStatus.status) {
		return;
	}
	let driver;
	try {
		log.info(`Rate match ${ids} with '${totalName}'`);
		driver = await driverChrome();
		await init(driver);
		await driver.get(urlStartPage);
		if (await authorization(driver)) {
			await availability(driver);
			log.info('Authorization successfully');
			for (const timeoutOne of searchTimeouts) {
				if (await search(driver, ids)) {
					log.info('Search match successfully');

					for (const timeoutTwo of searchTimeouts) {
						if (await searchRate(driver, numberColumn, totalName)) {
							break;
						}
						log.debug(`Search rate sleep on ${timeoutTwo}ms`);
						await driver.sleep(timeoutTwo);
					}
					break;
				}
				log.debug(`Search did not find match or close promo modal - sleep on ${timeoutOne}ms`);
				await availability(driver);
				await driver.sleep(timeoutOne);
			}
		}
		await screenShot(driver, `${(new Date()).getTime()}.png`, nameBot);
		await driver.sleep(speed.fast);
		await driver.quit();
	} catch (e) {
		log.error(`Error performEmulation ->  ${JSON.stringify(e)}`);
		//FIXME падает ошибка и рушит все
		await screenShot(driver, `${(new Date()).getTime()}.png`, nameBot);
		await driver.sleep(speed.fast);
		await driver.quit();
	}
}

/**
 * Метод для авторизации пользователя.
 *
 * @param {object} driver инстанс драйвера
 * @returns {Promise<boolean>}
 */
async function authorization(driver) {
	await driver.sleep(speed.fast);
	if (!await findIdAndCall(driver, 'curLoginForm')) {
		if (await findSelectorCss(driver, '.wrap_lk')) {
			return true;
		}
	} else {
		await findIdAndFill(driver, 'auth_id_email', auth.login);
		await findIdAndFill(driver, 'auth-form-password', auth.password);
		if (await findCssAndCall(driver, '.auth-button.auth-button--block')) {
			await driver.sleep(speed.fast);
			return true;
		}
	}
	sendNotification('Authorization failed');
	return false;
}

/**
 * Метод для поиска матча на странице.
 *
 * @param {object} driver инстанс драйвера
 * @param {Number} ids идентификатор матча
 * @returns {Promise<boolean>}
 */
async function search(driver, ids) {
	try {
		if (await findSelectorCss(driver, '.ls-panel__head.ls-panel__head--search')
			&& await findSelectorCss(driver, '.wrap_lk')
			&& await findSelectorCss(driver, '.ls-filter__search .ls-search__button')
		) {
			if (!await isElementByCss(driver, '.ls-search__button.active')) {
				await findCssAndCall(driver, '.ls-search__button');
			}
			await findSelectorCssAndFill(driver, '.ls-search__input.searchInput.keyboardInput', ids.toString());
			await findCssAndCall(driver, '.ls-search__button');
			return await popup(driver);
		}
	} catch (e) {
		console.log(`Search match failed - ${JSON.stringify(e)}`);
	}
	sendNotification('Search match failed');
	return false;
}

/**
 * Метод для выбора искомого матча в модалке.
 *
 * @param {object} driver инстанс драйвера
 * @returns {Promise<boolean>}
 */
async function popup(driver) {
	if (await findSelectorCss(driver, '.search-popup.v-modal-search') &&
		await findSelectorCss(driver, '.search-popup-events > .search-popup-events__item')
	) {
		try {
			await findCssAndCall(driver, '.search-popup-events > .search-popup-events__item:first-child');
			return await switchTab(driver);
		} catch (e) {
			sendNotification(`Can't search current match: ${JSON.stringify(e)}`);
			return false;
		}
	}
	sendNotification('Search match in popup failed');
	return false;
}

/**
 * Метод для поиска нужного коэфициента для ставки.
 *
 * @param {object} driver инстанс драйвера
 * @param {Number} numberColumn номер столбца тотала
 * @param {String} totalName искомая ставка
 * @returns {Promise<boolean>}
 */
async function searchRate(driver, numberColumn, totalName) {
	if (await findSelectorCss(driver, `[data-type="${numberColumn}"]`)) {
		if (!await isElementByCss(driver, `.bets.betCols2 > .blockSob > [data-type="${numberColumn}"]`)) {
			try {
				if (await findTextBySelectorCssAndCall(driver, `[data-type="${numberColumn}"]`, totalName)) {
					return await rate(driver);
				} else {
					sendNotification('Current match not found');
					return false;
				}
			} catch (e) {
				sendNotification(`Rate locked on current match: ${JSON.stringify(e)}`);
				return false;
			}
		}
		sendNotification(`Rate ${totalName} locked on current match`);
	} else {
		sendNotification('Search rate on match failed');
	}
	return false;
}

/**
 * Ставка выбраного коэфициента.
 *
 * @param {object} driver инстанс драйвера
 * @returns {Promise<boolean>}
 */
async function rate(driver) {
	if (await findSelectorCssAndFill(driver, '.coupon__bet-settings .bet_sum_input', rateAmount.bets)) {
		log.info(`bet_sum_input ${rateAmount.bets}`);
		/*if (!await isElementByCss(driver, '.coupon__bet-settings > .coupon-grid__row.coupon-grid__row--hide-borders.coupon-grid__row--filled')) {
			await findCssAndCall(driver, '.coupon__bet-settings > .coupon-grid__row.coupon-grid__row--hide-borders.coupon-grid__row--filled');
			await findTextBySelectorCssAndCall(driver, '.coupon-grid__row--filled > .multiselect__option', 'Accept any change');
			log.debug('Chose when odds change');
		}*/
		await findCssAndCall(driver, '.coupon-btn-group .coupon-btn-group__item');
		if (await findSelectorCss(driver, '.swal2-error')) {
			sendNotification('Bet error');
			// FIXME придумать как нажимать ок на модалках
			return true;
		} else if (await findSelectorCss(driver, '.swal2-warning')) {
			sendNotification('Bet warning');
			// FIXME придумать как нажимать ок на модалках
			return true;
		}
		log.info('Rate successfully');
		return true;
	}
	sendNotification('Rate failed');
	return false;
}

/**
 * Проверка доступности ставки.
 *
 * @param {object} driver инстанс драйвера
 * @returns {Promise<boolean>}
 */
async function availability(driver) {
	try {
		if (authPhone.status) {
			await checkPhone(driver);
			await closePromo(driver);
		}
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * Метод для поиска надоедливого всплывающего окна и закрытие его.
 *
 * @param {object} driver инстанс драйвера
 * @returns {Promise<boolean>}
 */
async function closePromo(driver) {
	if (await findById(driver, 'promoPoints')) {
		try {
			await findCssAndCall(driver, '.box-modal_close');
			return true;
		} catch (e) {
			sendNotification(`Can't close promo banner: ${JSON.stringify(e)}`);
			return false;
		}
	}
	return false;
}

/**
 * Метод для поиска надоедливого всплывающего окна и закрытие его.
 *
 * @param {object} driver инстанс драйвера
 * @returns {Promise<boolean>}
 */
async function checkPhone(driver) {
	if (await findById(driver, 'app')) {
		try {
			if (await findSelectorCss(driver, '.block-window')) {
				rateStatus.turnOff();
				await screenShot(driver, `${(new Date()).getTime()}.png`, nameBot);
				sendMessageSupport(decorateMessageWaitingPhone(nameBot));
				await driver.sleep(speed.waitingForCode);

				if (authPhone.phone) {
					await findIdAndFill(driver, 'phone_middle', authPhone.phone);
					await findCssAndCall(driver, '.block-window__btn');
					await driver.sleep(speed.normal);

					if (await findSelectorCss(driver, '.swal2-error.swal2-animate-error-icon')) {
						sendNotification('Неверный номер телефона');
					} else if (await findSelectorCss(driver, '.swal2-info.swal2-animate-info-icon')) {
						sendNotification('The phone is correct');
						await findCssAndCall(driver, '.swal2-confirm');
						await driver.sleep(speed.fast);
						await screenShot(driver, `${(new Date()).getTime()}.png`, nameBot);
						sendMessageSupport(decorateMessageWaitingCode(nameBot));
						await driver.sleep(speed.waitingForCode);

						if (authPhone.code) {
							await findIdAndFill(driver, 'input_otp', authPhone.code);
							await findCssAndCall(driver, '.block-window__btn');
							await driver.sleep(speed.normal);
							await screenShot(driver, `${(new Date()).getTime()}.png`, nameBot);

							if (!(await findSelectorCss(driver, '.swal2-error.swal2-animate-error-icon'))) {
								sendNotification('checkPhone successfully');
								rateStatus.turnOn();
								return true;
							}
						}
					}
				}
				sendMessageSupport(decorateMessageVerification());
			}
			return false;
		} catch (e) {
			sendNotification(`Can't close check phone: ${JSON.stringify(e)}`);
			return false;
		}
	}
	return false;
}

/**
 * Метод для логирования обработанных ошибок в чат и лог файл.
 *
 * @param {String} text текст ошибки
 */
function sendNotification(text) {
	log.debug(text);
	sendMessageSupport(`<pre>${text}</pre>`);
}

module.exports = {
	performEmulation
};