const {log} = require('../../utils/logger');
const config = require('config');
const {rateStatus} = require('../../store/rateStatus');
const {
	switchTab,
	driverChrome,
	findSelectorCss,
	findTextBySelectorCssAndCall,
	init,
	findSelectorCssAndCall,
	screenShot,
	findIdAndFill,
	findIdAndCall,
	findSelectorCssAndFill
} = require('../api');

const auth = config.auth;
const betAmount = config.emulator.betAmount;
const active = config.parser.active;
const urlStartPage = config.parser[`${active[0]}`]['startPage'];

/**
 * Массив интервалов в миллисекундах после которых делается попытка снова
 */
const searchTimeouts = [2000, 5000, 8000, 12000, 15000, 1];

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
		log.info(`Rate match ${ids} with "${totalName}"`);
		driver = await driverChrome();
		await init(driver);
		await driver.get(urlStartPage);
		if (await authorization(driver)) {
			if (await search(driver, ids)) {
				await rate(driver, numberColumn, totalName);
			}
		}
		await screenShot(driver, `${(new Date()).getTime()}.png`);
		await driver.sleep(10000);
		await driver.quit();
	} catch (e) {
		log.error('Error performEmulation -> ' + e);
		await screenShot(driver, `${(new Date()).getTime()}.png`);
		await driver.sleep(10000);
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
	for (const timeout of searchTimeouts) {
		if (await findSelectorCss(driver, '.loginDropTop .loginDropTop_con > .curloginDropTop.base_auth_form')) {

			await findSelectorCssAndCall(driver, '.loginDropTop .loginDropTop_con > .curloginDropTop.base_auth_form');
			await findIdAndFill(driver, 'auth_id_email', auth.login);
			await findIdAndFill(driver, 'auth-form-password', auth.password);
			await findIdAndCall(driver, 'remember_user');
			if (await findSelectorCss(driver, '.auth-button.auth-button--block')) {
				await findSelectorCssAndCall(driver, '.auth-button.auth-button--block');
				await driver.sleep(5000);
				return true;
			}
		} else if (await findSelectorCss(driver, '.wrap_lk')) {
			return true;
		} else {
			log.debug(`Authorization sleep on ${timeout}ms`);
			await driver.sleep(timeout);
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
	for (const timeout of searchTimeouts) {
		if (await findSelectorCss(driver, '.ls-panel__head.ls-panel__head--search') && await findSelectorCss(driver, '.wrap_lk') && await findSelectorCss(driver, '.ls-filter__search .ls-search__button')) {

			if (!await findSelectorCss(driver, '.ls-search__button.active')) {
				await findSelectorCssAndCall(driver, '.ls-search__button');
			}
			await findSelectorCssAndFill(driver, '.ls-search__input.searchInput.keyboardInput', ids.toString());
			await findSelectorCssAndCall(driver, '.ls-search__button');
			return await popup(driver);
		} else {
			log.debug(`Search sleep on ${timeout}ms`);
			await driver.sleep(timeout);
		}
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
	for (const timeout of searchTimeouts) {
		if (await findSelectorCss(driver, '.search-popup.v-modal-search') &&
			await findSelectorCss(driver, '.search-popup-events > .search-popup-events__item')) {
			try {
				await findSelectorCssAndCall(driver, '.search-popup-events > .search-popup-events__item:first-child');
			} catch (e) {
				log.debug('Can`t search current match: ', e);
				return false;
			}
			return await switchTab(driver);
		} else {
			log.debug(`Popup sleep on ${timeout}ms`);
			await driver.sleep(timeout);
		}
	}
	log.debug('Search match in popup failed');
	return false;
}

/**
 * Метод для выбора ставки и сама ставка.
 *
 * @param {object} driver инстанс драйвера
 * @param {Number} numberColumn номер столбца тотала
 * @param {String} totalName искомая ставка
 * @returns {Promise<boolean>}
 */
async function rate(driver, numberColumn, totalName) {
	for (const timeout of searchTimeouts) {
		if (await findSelectorCss(driver, `[data-type="${numberColumn}"]`)) {
			try {
				if (await findTextBySelectorCssAndCall(driver, `[data-type="${numberColumn}"]`, totalName)) {
					if (await findSelectorCss(driver, '.coupon__bet-settings .bet_sum_input')) {
						await findSelectorCssAndFill(driver, '.coupon__bet-settings .bet_sum_input', betAmount);
						await findSelectorCssAndCall(driver, '.coupon-btn-group .coupon-btn-group__item');
						log.info('Rate successfully');
						// FIXME подумать как обойти если изменился коэффициент
						return true;
					}
				} else {
					log.debug('Current match not found');
					return false;
				}
			} catch (e) {
				log.debug('Rate locked on current match: ', e);
				return false;
			}
		} else {
			log.debug(`Rate sleep on ${timeout}ms`);
			await driver.sleep(timeout);
		}
	}
	log.debug('Rate on match failed');
	return false;
}

module.exports = {
	performEmulation
};