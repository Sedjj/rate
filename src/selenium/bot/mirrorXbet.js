const {log} = require('../../utils/logger');
const config = require('config');
const {rateStatus} = require('../../store/rateStatus');
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
};

/**
 * Массив интервалов в миллисекундах после которых делается попытка поиска элемента
 */
const searchTimeouts = [2000, 5000, 8000, 12000, 15000, 1];

const auth = config.auth;
const betAmount = config.emulator.betAmount;
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
			await closePromo(driver);
			if (await search(driver, ids)) {
				for (const timeout of searchTimeouts) {
					if (!(await searchRate(driver, numberColumn, totalName))) {
						log.debug(`Search rate sleep on ${timeout}ms`);
						await driver.sleep(timeout);
					} else {
						break;
					}
				}
			}
		}
		await screenShot(driver, `${(new Date()).getTime()}.png`);
		await driver.sleep(speed.fast);
		await driver.quit();
	} catch (e) {
		log.error(`Error performEmulation ->  ${e}`);
		//FIXME падает ошибка и рушит все
		await screenShot(driver, `${(new Date()).getTime()}.png`);
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
	log.debug('Authorization failed');
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
	log.debug('Search match failed');
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
			log.debug(`Can't search current match: ${e}`);
			return false;
		}
	}
	log.debug('Search match in popup failed');
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
					log.debug('Current match not found');
					return false;
				}
			} catch (e) {
				log.debug(`Rate locked on current match: ${e}`);
				return false;
			}
		}
		log.debug(`Rate ${totalName} locked on current match`);
	}
	log.debug('Search rate on match failed');
	return false;
}

/**
 * Ставка выбраного коэфициента.
 *
 * @param {object} driver инстанс драйвера
 * @returns {Promise<boolean>}
 */
async function rate(driver) {
	if (await findSelectorCssAndFill(driver, '.coupon__bet-settings .bet_sum_input', betAmount)) {
		log.info('bet_sum_input');
		/*if (!await isElementByCss(driver, '.coupon__bet-settings > .coupon-grid__row.coupon-grid__row--hide-borders.coupon-grid__row--filled')) {
			await findCssAndCall(driver, '.coupon__bet-settings > .coupon-grid__row.coupon-grid__row--hide-borders.coupon-grid__row--filled');
			await findTextBySelectorCssAndCall(driver, '.coupon-grid__row--filled > .multiselect__option', 'Accept any change');
			log.debug('Chose when odds change');
		}*/
		await findCssAndCall(driver, '.coupon-btn-group .coupon-btn-group__item');
		if (await findSelectorCss(driver, '.swal2-error')) {
			log.info('Rate error');
			// FIXME придумать как нажимать ок на модалках
			return true;
		} else if (await findSelectorCss(driver, '.swal2-warning')) {
			log.info('Rate warning');
			// FIXME придумать как нажимать ок на модалках
			return true;
		}
		log.info('Rate successfully');
		return true;
	}
	log.debug('Rate failed');
	return false;
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
			log.debug(`Can't close promo banner: ${e}`);
			return false;
		}
	}
	return false;
}

module.exports = {
	performEmulation
};