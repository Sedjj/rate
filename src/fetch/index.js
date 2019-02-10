const config = require('config');
const request = require('request');
const log = require('./../utils/logger');
const {getStringToUTCDateString} = require('./../utils/dateFormat');

const proxy = config.get('proxy');

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
 * @param {Date} date - дата
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
			/*parse_mode: 'HTML'*/
		}
	};
	if (process.env.NODE_ENV === 'development') {
		props = {...props, proxy: `http://${proxy.user}:${proxy.password}@${proxy.host}:${proxy.port}`};
	}
	return new Promise((resolve, reject) => {
		request(props.url, props, (error, res, body) => {
			if (error || (res && res.statusCode !== 200)) {
				log.error(`setFileApiTelegram: ${res ? res.statusMessage : (error && error.message)}`);
				return reject(error);
			}
			log.debug(`Отработал: Метод для отправки соощения ${JSON.stringify(body.result)}`);
			resolve(body);
		});
	});
}

module.exports = {
	getAllMatches,
	getExpandedMatch,
	postResultZone,
	getResultList,
	setFileApiTelegram,
	setTextApiTelegram
};