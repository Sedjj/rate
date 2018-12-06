const config = require('config');
const request = require('request');
const log = require('./../utils/logger');
const {getStringToDateTime} = require('./../utils/dateFormat');

const urlFootballRate = config.get('parser.live.football.rate');
const urlFootballExpandedRate = config.get('parser.live.football.expandedRate');
const urlAllZone = config.get('parser.result.allZone');
const urlAll = config.get('parser.result.all');

const token = process.env.NODE_ENV === 'development'
	? config.get('bots.dev.token')
	: config.get('bots.prod.token');
const proxy = config.get('proxy');

/**
 * Метод для получения ставок.
 *
 * @returns {Promise<JSON | void>}
 */
function getFootball() {
	return new Promise((resolve, reject) => {
		request.get(urlFootballRate, (error, res, body) => {
			if (error || (res && res.statusCode !== 200)) {
				log.error(`getFootball: ${res ? res.statusMessage : (error && error.message)}`);
				return reject(error);
			}
			let value = [];
			try {
				value = JSON.parse(body).Value;
			} catch (error) {
				log.error(`getFootball JSON.parse: ${error}`);
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
 * @param {Array} id матча
 * @returns {Promise<JSON | void>}
 */
function getFootballExpanded(id) {
	return new Promise((resolve, reject) => {
		request.get(urlFootballExpandedRate.replace('${id}', id), (error, res, body) => {
			if (error || (res && res.statusCode !== 200)) {
				log.error(`getFootballExpanded: ${res ? res.statusMessage : (error && error.message)}`);
				return reject(error);
			}
			let value = [];
			try {
				value = JSON.parse(body).Value;
			} catch (error) {
				log.error(`getFootballExpanded JSON.parse: ${error}`);
				return	reject(error);
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
 * @param {Date} date - дата
 * @returns {Promise<JSON | void>}
 */
function postResultZone(date) {
	return new Promise((resolve, reject) => {
		const param = {
			'Language': 'ru',
			'Params': [getStringToDateTime(date), null, null, null, null, 300],
			'Vers': 6,
			'Adult': false,
			'partner': 51
		};
		request({
			url: urlAllZone,
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
 * @param {Date} date - дата
 * @returns {Promise<any>}
 */
function postResult(date) {
	return new Promise((resolve, reject) => {
		log.info(`postResult: ${urlAll.replace('${date}', getStringToDateTime(date))}`);
		request.get(urlAll.replace('${date}', getStringToDateTime(date)), (error, res, body) => {
			if (error || (res && res.statusCode !== 200)) {
				log.error(`postResult: ${res ? res.statusMessage : (error && error.message)}`);
				return reject(error);
			}
			let value = [];
			try {
				value = JSON.parse(body).Data;
			} catch (error) {
				log.error(`postResult: ${error}`);
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
 * @param {String} chatId id чата
 * @param {Object} document данные для отправки
 * @returns {Promise}
 */
function setFileApiTelegram(chatId, document) {
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

module.exports = {
	getFootball,
	getFootballExpanded,
	postResultZone,
	postResult,
	setFileApiTelegram
};