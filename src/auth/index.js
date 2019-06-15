const config = require('config');
const got = require('got');
const {CookieJar} = require('tough-cookie');
const {encode} = require('../utils/crypt');

const active = config.parser.active;
/*const urlAuth = config.parser[`${active[0]}`].authentication.auth;*/
/*const urlUserData = config.parser[`${active[0]}`].rate['getuserdata'];*/
const urlPutbetsCommon = config.parser[`${active[0]}`].rate['putbetscommon'];
const urlUpdateCoupon = config.parser[`${active[0]}`].rate['updateCoupon'];
const urlBalance = config.parser[`${active[0]}`].rate['balance'];

const cookieJar = new CookieJar();
const client = got.extend({
	baseUrl: 'https://1xstavka.ru',
	cookieJar
});

async function performAuth() {
	const param = {
		uLogin: encode('55311279'), // 'NTUzMTEyNzk=',
		uPassword: encode('088706'), // 'MDg4NzA2'
	};
	await getGGRU();
	await getUserData();
	await authentication(param);
	/*await twofactor(param);
	await putbetsCommon(param);
	await updateCoupon();
	await getBalance();*/
}

/**
 * Метод для получения начальных куков.
 *
 * @returns {Promise<void>}
 */
async function getUserData() {
	await client.get('/', {
		headers: {
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
		}
	});
	await client.get('en', {
		headers: {
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
		}
	});
	await client.post('getuserdata', {
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'X-Requested-With': 'XMLHttpRequest',
		}
	});
	await client.get('getuserdata', {
		headers: {
			'Accept': '*/*',
			'X-Requested-With': 'XMLHttpRequest',
		}
	});
}

async function getGGRU() {
	const {body} = await client.get('en/live/');
	const value = body.match(/(?:GGRU\s=\s)+(\d*)/ig);
	if (value.length) {
		const GGRU = value[0].split('=')[1];

		cookieJar.setCookie(`ggru=${GGRU}`, 'https://1xstavka.ru', {}, () => {
		});
	}
}

/**
 * Метод для авторизации пользователя.
 *
 * @param {Object} param параметры для отправки
 * returns {Promise<void>}
 */
async function authentication(param) {
	const body = await client.post('en/user/auth', {
		headers: {
			'Content-Type': 'application/json;charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest',
			'Accept': 'application/json, text/plain, */*'
		},
		responseType: 'json',
		body: JSON.stringify({
			uLogin: param.uLogin,
			uPassword: param.uPassword,
			save: false
		})
	});
	console.log(body);
}

/**
 * Метод для ставки.
 *
 * @returns {Promise<void>}
 */
async function putbetsCommon() {
	await client.post(urlPutbetsCommon, {
		headers: {
			'Content-Type': 'application/json;charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest',
			'Accept': 'application/json, text/plain, */*'
		},
		responseType: 'json',
		body: JSON.stringify({
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
	});
}

/**
 * Метод для обновления купонов.
 *
 * @returns {Promise<void>}
 */
async function updateCoupon() {
	await client.post(urlUpdateCoupon, {
		headers: {
			'Content-Type': 'application/json;charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest',
			'Accept': 'application/json, text/plain, */*'
		},
		responseType: 'json',
		body: JSON.stringify({
			'Events': [{'GameId': 186133331, 'Type': 10, 'Coef': 1.9, 'Param': 1, 'PlayerId': 0, 'Kind': 1, 'InstrumentId': 0, 'Seconds': 0, 'Price': 0, 'Expired': 0}],
			'NeedUpdateLine': false,
			'Lng': 'en',
			'UserId': 55311279,
			'CfView': 0,
			'Vid': 0,
			'partner': 51
		})
	});
}

/**
 * Проверка баланса.
 *
 * @returns {Promise<void>}
 */
async function getBalance() {
	await client.post(urlBalance, {
		headers: {
			'Content-Type': 'application/json;charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest',
			'Accept': 'application/json, text/plain, */*'
		},
		responseType: 'json',
		body: JSON.stringify({
			'Events': [{'GameId': 186133331, 'Type': 10, 'Coef': 1.9, 'Param': 1, 'PlayerId': 0, 'Kind': 1, 'InstrumentId': 0, 'Seconds': 0, 'Price': 0, 'Expired': 0}],
			'NeedUpdateLine': false,
			'Lng': 'en',
			'UserId': 55311279,
			'CfView': 0,
			'Vid': 0,
			'partner': 51
		})
	});
}

module.exports = {
	performAuth,
	getBalance,
	updateCoupon,
	putbetsCommon
};