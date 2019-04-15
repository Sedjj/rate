const config = require('config');
const request = require('superagent');
const {log} = require('../utils/logger');
const FormData = require('form-data');
const {encode} = require('../utils/crypt');

const active = config.parser.active;
const urlAuth = config.get(`parser.${active[0]}.authentication.auth`);
const urlTwofactor = config.get(`parser.${active[0]}.authentication.twofactor`);
const urlUserdata = config.get(`parser.${active[0]}.rate.getuserdata`);
const urlPutbetscommon = config.get(`parser.${active[0]}.rate.putbetscommon`);
const urlUpdateCoupon = config.get(`parser.${active[0]}.rate.updateCoupon`);
const urlBalance = config.get(`parser.${active[0]}.rate.balance`);
const agent = request.agent('/cookied-page');

async function performAuth() {
	const param = {
		uLogin: encode('55311279'), // 'NTUzMTEyNzk=',
		uPassword: encode('088706'), // 'MDg4NzA2'
	};
	await getuserdata();
	await authentication(param);
	await twofactor(param);
	await putbetsCommon(param);
	await updateCoupon();
	await getBalance();
}

/**
 * Метод для получения начальных куков.
 *
 * @returns {Promise<void>}
 */
async function getuserdata() {
	await agent.post(urlUserdata)
		.set({
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'X-Requested-With': 'XMLHttpRequest',
		})
		.type('json')
		.then((res) => {
			console.log('getuserdata', res.text);
		})
		.catch(error => {
			log.debug(`Ошибка getuserdata: ${error}`);
		});
}

/**
 * Метод для авторизации пользователя.
 *
 * @param {Object} param параметры для отправки
 * returns {Promise<void>}
 */
async function authentication(param) {
	await agent.post(urlAuth)
		.set({
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest'
		})
		.type('json')
		.auth(param.uLogin, param.uPassword, {type: 'auto'})
		.then((res) => {
			console.log('auth', res.text);
			//return agent.get('/cookied-page');
		})
		.catch(error => {
			log.debug(`Ошибка авторизации: ${JSON.stringify(param)}, error: ${error}`);
		});
}

/**
 * Метод двухфакторной авторизации.
 *
 * @param {Object} param параметры для отправки
 * @returns {Promise<void>}
 */
async function twofactor(param) {
	// FIXME через FormData
	await agent.post(urlTwofactor)
		.set({
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'X-Requested-With': 'XMLHttpRequest',
		})
		.type('json')
		.then((res) => {
			console.log('getuserdata', res.text);
			log.debug('Отработал: Метод для авторизации пользователя');
		})
		.catch(error => {
			log.debug(`Ошибка getuserdata: ${error}`);
		});
}

/**
 * Метод для ставки.
 *
 * @param {Object} param параметры для отправки
 * @returns {Promise<void>}
 */
async function putbetsCommon(param) {
	await agent.post(urlPutbetscommon)
		.set({
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Content-Type': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
		})
		.type('json')
		.send({
			'Live': true,
			'Events': [{
				'GameId': 186133331,
				'Type': 10,
				'Coef': 1.9, // значение ставки
				'Param': 1, // коэфициент ставки
				'PlayerId': 0,
				'Kind': 1,
				'InstrumentId': 0,
				'Seconds': 0,
				'Price': 0,
				'Expired': 0
			}],
			'Summ': '20',
			'Lng': 'en',
			'UserId': 55311279,
			'Vid': 0,
			'hash': '560164bd9545333ad0d346fedb4c9763',
			'CfView': 0,
			'notWait': true,
			'Source': 50,
			'CheckCf': 2,
			'partner': 51
		})
		.then((res) => {
			console.log('getuserdata', res.text);
		})
		.catch(error => {
			log.debug(`Ошибка getuserdata: ${error}`);
		});
}

/**
 * Метод для обновления купонов.
 *
 * @returns {Promise<void>}
 */
async function updateCoupon() {
	await agent.post(urlUpdateCoupon)
		.set({
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Content-Type': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
		})
		.type('json')
		.send({
			'Events': [{'GameId': 186133331, 'Type': 10, 'Coef': 1.9, 'Param': 1, 'PlayerId': 0, 'Kind': 1, 'InstrumentId': 0, 'Seconds': 0, 'Price': 0, 'Expired': 0}],
			'NeedUpdateLine': false,
			'Lng': 'en',
			'UserId': 55311279,
			'CfView': 0,
			'Vid': 0,
			'partner': 51
		})
		.then((res) => {
			console.log('getuserdata', res.text);
		})
		.catch(error => {
			log.debug(`Ошибка getuserdata: ${error}`);
		});
}

/**
 * Проверка баланса.
 *
 * @returns {Promise<void>}
 */
async function getBalance() {
	await agent.post(urlBalance)
		.set({
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Content-Type': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
		})
		.type('json')
		.send({
			'Events': [{'GameId': 186133331, 'Type': 10, 'Coef': 1.9, 'Param': 1, 'PlayerId': 0, 'Kind': 1, 'InstrumentId': 0, 'Seconds': 0, 'Price': 0, 'Expired': 0}],
			'NeedUpdateLine': false,
			'Lng': 'en',
			'UserId': 55311279,
			'CfView': 0,
			'Vid': 0,
			'partner': 51
		})
		.then((res) => {
			console.log('getuserdata', res.text);
		})
		.catch(error => {
			log.debug(`Ошибка getuserdata: ${error}`);
		});
}

module.exports = {
	performAuth
};