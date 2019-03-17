const config = require('config');
const querystring = require('querystring');
const request = require('request');
const FormData = require('form-data');
const {log} = require('./../utils/logger');
const {getStringToUTCDateString} = require('./../utils/dateFormat');
const {Cookie} = require('request-cookies');

const proxy = config.get('proxy');
const cookie = new Map();

/**
 * Метод для получения ставок.
 *
 * @param {String} url адрес запроса
 * @returns {Promise<JSON | void>}
 */
function getAllMatches(url) {
	return new Promise((resolve, reject) => {
		request.get(url, (error, res, body) => {
			if (error || (res && res.statusCode !== 200)) {
				log.error(`getAllMatches: ${res ? res.statusMessage : (error && error.message)}`);
				return reject(error);
			}
			let value = [];
			try {
				value = JSON.parse(body).Value;
			} catch (error) {
				log.error(`getAllMatches JSON.parse: ${error}`);
				return reject(error);
			}
			if (value === null) {
				return reject(body);
			}
			// log.debug('Отработал: Метод для получения ставок');
			resolve(value);
		});
	});
}

/**
 * Метод для получения расширеных ставок.
 *
 * @param {String} url адрес запроса
 * @returns {Promise<JSON | void>}
 */
function getExpandedMatch(url) {
	return new Promise((resolve, reject) => {
		request.get(url, (error, res, body) => {
			if (error || (res && res.statusCode !== 200)) {
				log.error(`getExpandedMatch: ${res ? res.statusMessage : (error && error.message)}`);
				return reject(error);
			}
			let value = [];
			try {
				value = JSON.parse(body).Value;
			} catch (error) {
				log.error(`getExpandedMatch JSON.parse: ${error}`);
				return reject(error);
			}
			if (value === null) {
				return reject(body);
			}
			// log.debug('Отработал: Метод для получения расширеных ставок');
			resolve(value);
		});
	});
}

/**
 * Метод для получения всех результатов из зоны
 *
 * @param {String} url адрес запроса
 * @param {String} date - дата
 * @returns {Promise<JSON | void>}
 */
function postResultZone(url, date) {
	return new Promise((resolve, reject) => {
		const param = {
			'Language': 'ru',
			'Params': [getStringToUTCDateString(date), null, null, null, null, 300],
			'Vers': 6,
			'Adult': false,
			'partner': 51
		};
		request({
			url: url,
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			json: param
		}, (error, res, body) => {
			if (error) {
				log.error(`postResultZone: ${error}`);
				return reject(error);
			}
			log.debug('Отработал: Метод для получения всех результатов в zone');
			resolve(body.Data);
		});
	});
}

/**
 * Метод для получения всех результатов.
 *
 * @param {String} url адрес запроса
 * @returns {Promise<any>}
 */
function getResultList(url) {
	return new Promise((resolve, reject) => {
		log.info(`getResultList: ${url}`);
		request.get(url, (error, res, body) => {
			if (error || (res && res.statusCode !== 200)) {
				log.error(`getResultList: ${res ? res.statusMessage : (error && error.message)}`);
				return reject(error);
			}
			let value = [];
			try {
				value = JSON.parse(body).Data;
			} catch (error) {
				log.error(`getResultList: ${error}`);
				return reject(error);
			}
			if (value === null) {
				return reject(body);
			}
			log.debug('Отработал: Метод для получения расширеных ставок');
			resolve(value);
		});
	});
}

/**
 * Отправляет файл на API Telegram
 * https://api.telegram.org/bot741639693:AAHcc9e7pIYSWlAti95Idwejn0iZcwSUqmg/getupdates
 *
 * @param {String} token идентификатор бота
 * @param {String} chatId id чата
 * @param {Object} document данные для отправки
 * @returns {Promise}
 */
function setFileApiTelegram(token, chatId, document) {
	let props = {
		url: `https://api.telegram.org/bot${token}/sendDocument`,
		headers: {
			'content-type': 'multipart/form-data'
		},
		formData: {
			chat_id: chatId,
			document: document
		},
	};
	if (process.env.NODE_ENV === 'development') {
		props = {...props, proxy: `http://${proxy.user}:${proxy.password}@${proxy.host}:${proxy.port}`};
	}
	return new Promise((resolve, reject) => {
		request.post(props, (error, res, body) => {
			if (error || (res && res.statusCode !== 200)) {
				log.error(`setFileApiTelegram: ${res ? res.statusMessage : (error && error.message)}`);
				return reject(error);
			}
			log.debug(`Отработал: Метод для отправки файла ${body}`);
			resolve(body);
		});
	});
}

/**
 * Отправляет сообщение в чат или канал на API Telegram.
 *
 * @param {String} token идентификатор бота
 * @param {String} chatId id чата
 * @param {String} text текст сообщения
 * @returns {Promise<any>}
 */
function setTextApiTelegram(token, chatId, text) {
	let props = {
		url: `https://api.telegram.org/bot${token}/sendMessage`,
		headers: {
			'content-type': 'application/json'
		},
		json: {
			chat_id: chatId,
			text: text,
			parse_mode: 'HTML'
		}
	};
	if (process.env.NODE_ENV === 'development') {
		props = {...props, proxy: `http://${proxy.user}:${proxy.password}@${proxy.host}:${proxy.port}`};
	}
	return new Promise((resolve, reject) => {
		request.post(props, (error, res, body) => {
			if (error || (res && res.statusCode !== 200)) {
				log.error(`setFileApiTelegram: ${res ? res.statusMessage : (error && error.message)}`);
				return reject(error);
			}
			log.debug(`Отработал: Метод для отправки соощения ${JSON.stringify(body.result)}`);
			resolve(body);
		});
	});
}

/**
 * Отправляет сообщение в чат support на API Telegram.
 * Сделан отдельный метод где нет логирования а то уходит в рекурсию
 *
 * @param {String} token идентификатор бота
 * @param {String} chatId id чата
 * @param {String} text текст сообщения
 * @returns {Promise<any>}
 */
function setSupportMsgApiTelegram(token, chatId, text) {
	let props = {
		url: `https://api.telegram.org/bot${token}/sendMessage`,
		headers: {
			'content-type': 'application/json'
		},
		json: {
			chat_id: chatId,
			text: text,
			parse_mode: 'HTML'
		}
	};
	if (process.env.NODE_ENV === 'development') {
		props = {...props, proxy: `http://${proxy.user}:${proxy.password}@${proxy.host}:${proxy.port}`};
	}
	return new Promise((resolve, reject) => {
		request.post(props, (error, res, body) => {
			if (error || (res && res.statusCode !== 200)) {
				return reject(error);
			}
			resolve(body);
		});
	});
}

/**
 * Метод для авторизации пользователя.
 *
 * @param {String} url адрес запроса
 * @param {Object} param параметры для отправки
 * @param {Object} headers объект заголовка
 * @returns {Promise<any>}
 */
function authentication(url, param, headers) {
	const formData = querystring.stringify(param);
	return new Promise((resolve, reject) => {
		request.post({
			url: url,
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'X-Requested-With': 'XMLHttpRequest',
				'Cookie': headers.cookie
			},
			body: formData
		}, (error, res, body) => {
			if (error && res.statusCode !== 200) {
				log.error(`authentication: ${error}`);
				return reject(error);
			}
			const setCookie = res.headers['set-cookie'];
			if (setCookie.length > 0) {
				setCookie.forEach((item) => {
					let cookieObj = new Cookie(item);
					cookie.set(cookieObj.key, cookieObj.value);
				});
			}
			log.debug('Отработал: Метод для авторизации пользователя');
			resolve(JSON.parse(body));
		});
	});
}

/**
 * Метод двухфакторной авторизации.
 *
 * @param {String} url адрес запроса
 * @param {Object} param параметры для отправки
 * @param {Object} headers объект заголовка
 * @returns {Promise<any>}
 */
function twofactor(url, param, headers) {
	const form = new FormData();
	form.append('type', 'first');
	console.log(Array.from(cookie));
	return new Promise((resolve, reject) => {
		request({
			url: url,
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'Cookie': headers.cookie
			},
			form: param
		}, (error, res, body) => {
			if (error && res.statusCode !== 200) {
				log.error(`authentication: ${error}`);
				return reject(error);
			}
			log.debug('Отработал: Метод для авторизации пользователя');
			resolve(res.headers['set-cookie'], body);
		});
	});
}

/**
 * Метод для обновления купонов.
 *
 * @param {String} url адрес запроса
 * @returns {Promise<any>}
 */
function updateCoupon(url) {
	return new Promise((resolve, reject) => {
		request({
			url: url,
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			}
		}, (error, res, body) => {
			if (error && res.statusCode !== 200) {
				log.error(`authentication: ${error}`);
				return reject(error);
			}
			const setCookie = res.headers['set-cookie'];
			for (let i in setCookie) {
				let temp = new Cookie(setCookie[i]);
				cookie.set(temp.key, temp.value);
				console.log(cookie.key, cookie.value);
			}
			log.debug('Отработал: Метод для обновления куков');
			resolve(res.headers['set-cookie'], body);
		});
	});
}

/**
 * Метод для ставки.
 *
 * @param {String} url адрес запроса
 * @param {Object} param параметры для отправки
 * @param {Object} headers объект заголовка
 * @returns {Promise<any>}
 */
function putbetsCommon(url, param, headers) {
	param.hash = cookie.get('uhash');
	return new Promise((resolve, reject) => {
		request({
			url: url,
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'Cookie': headers.cookie
			},
			body: param
		}, (error, res, body) => {
			if (error && res.statusCode !== 200) {
				log.error(`authentication: ${error}`);
				return reject(error);
			}
			log.debug('Отработал: Метод для авторизации пользователя');
			resolve(res.headers['set-cookie'], body);
		});
	});
}


module.exports = {
	getAllMatches,
	getExpandedMatch,
	postResultZone,
	getResultList,
	setFileApiTelegram,
	setTextApiTelegram,
	setSupportMsgApiTelegram,
	authentication,
	twofactor,
	updateCoupon,
	putbetsCommon
};