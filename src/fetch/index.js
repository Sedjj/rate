const config = require('config');
const got = require('got');
const {CookieJar} = require('tough-cookie');
const request = require('request');
const {log} = require('./../utils/logger');

/**
 * Массив интервалов в миллисекундах после которых делается попытка снова
 */
const searchTimeouts = [2000, 5000, 8000, 12000, 1];
const proxy = config.proxy;
const cookieJar = new CookieJar();
const client = got.extend({
	baseUrl: 'https://1xstavka.ru',
	cookieJar
});

/**
 * Метод для получения всех ставок по виду спорта.
 *
 * @param {String} url адрес запроса
 * @returns {Promise<JSON | void>}
 */
function getAllMatches(url) {
	return new Promise(async (resolve, reject) => {
		for (const timeout of searchTimeouts) {
			try {
				let value = [];
				const {body} = await client.get(url);
				try {
					value = JSON.parse(body)['Value'];
					if (value != null) {
						resolve(value);
						break;
					}
				} catch (error) {
					log.error(`Get all matches JSON.parse: ${error}`);
					reject('JSON parse error');
					break;
				}
				log.error(`Get all matches error: ${body}`);
				reject('request came empty');
				break;
			} catch (error) {
				log.error(`path: ${error.path}, name: ${error.name}, message: ${error.message})}`);
				log.debug(`Get all matches sleep on ${timeout}ms`);
				await sleep(timeout);
			}
		}
		reject('Server is not responding');
	});
}

/**
 * Метод для получения расширеных ставок для текущего матча.
 *
 * @param {String} url адрес запроса
 * @returns {Promise<JSON | void>}
 */
function getExpandedMatch(url) {
	return new Promise(async (resolve, reject) => {
		for (const timeout of searchTimeouts) {
			try {
				let value = [];
				const {body} = await client.get(url);
				try {
					value = JSON.parse(body)['Value'];
					if (value != null) {
						resolve(value);
						break;
					}
				} catch (error) {
					log.error(`Get expanded matches JSON.parse: ${error}`);
					reject('JSON parse error');
					break;
				}
				log.error(`Get expanded matches error: ${body}`);
				reject('request came empty');
				break;
			} catch (error) {
				log.error(`path: ${error.path}, name: ${error.name}, message: ${error.message})}`);
				log.debug(`Get expanded matches sleep on ${timeout}ms`);
				await sleep(timeout);
			}
		}
		reject('Server is not responding');
	});
}

/**
 * Метод для получения всех результатов.
 *
 * @param {String} url адрес запроса
 * @returns {Promise<any>}
 */
function getResultList(url) {
	return new Promise(async (resolve, reject) => {
		for (const timeout of searchTimeouts) {
			try {
				let value = [];
				log.debug(`url: ${url}`);
				const {body} = await client.get(url);
				try {
					value = JSON.parse(body)['Data'];
					if (value != null) {
						resolve(value);
						break;
					}
				} catch (error) {
					log.error(`Get result matches JSON.parse: ${error}`);
					reject('JSON parse error');
					break;
				}
				log.error(`Get result matches error: ${body}`);
				reject('request came empty');
				break;
			} catch (error) {
				log.error(`path: ${error.path}, name: ${error.name}, message: ${error.message})}`);
				log.debug(`Get result matches sleep on ${timeout}ms`);
				await sleep(timeout);
			}
		}
		reject('Server is not responding');
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
				log.error(`setFileApiTelegram: code: ${res.statusCode}, error: ${res ? res.statusMessage : (error && error.message)}`);
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
				log.error(`setFileApiTelegram: code: ${res.statusCode}, error: ${res ? res.statusMessage : (error && error.message)}`);
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
 * Функция ожидания реализованая через промис + таймаут, прелполагается использовать с async/await.
 *
 * @param {number} ms - количество миллисекунд которое требуется выждать
 * @return {Promise<number>} - промис, резолв которого будет означать что время вышло
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	getAllMatches,
	getExpandedMatch,
	getResultList,
	setFileApiTelegram,
	setTextApiTelegram,
	setSupportMsgApiTelegram
};