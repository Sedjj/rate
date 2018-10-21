const config = require('config');
const request = require('request');
const log = require('./../utils/logger');
const {getFormattedDate} = require('./../utils/dateFormat');

const urlFootballRate = config.get('parser.live.football.rate');
const urlFootballExpandedRate = config.get('parser.live.football.expandedRate');
const urlAllZone = config.get('parser.result.allZone');
const urlAll = config.get('parser.result.all');

/**
 * Метод для получения ставок.
 *
 * @returns {Promise<JSON | void>}
 */
function getFootball() {
	return new Promise((resolve, reject) => {
		request.get(urlFootballRate, (error, res, body) => {
			if (error && res.statusCode !== 200) {
				log.error(`error: ${error}`);
				return reject(error);
			}
			let value = [];
			try {
				value = JSON.parse(body).Value;
			} catch (error) {
				log.error(`Error getFootball JSON.parse: ${error}`);
			}
			log.debug('Отработал: Метод для получения ставок');
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
			if (error && res.statusCode !== 200) {
				log.error(`error: ${error}`);
				return reject(error);
			}
			let value = [];
			try {
				value = JSON.parse(body).Value;
			} catch (error) {
				log.error(`Error getFootballExpanded JSON.parse: ${error}`);
			}
			log.debug('Отработал: Метод для получения расширеных ставок');
			resolve(value);
		});
	});
}

/**
 * Метод для получения всех результатов из зоны
 *
 * @returns {Promise<JSON | void>}
 */
function postResultZone() {
	return new Promise((resolve, reject) => {
		const param = {
			'Language': 'ru',
			'Params': [getFormattedDate(new Date()), null, null, null, null, 300],
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
				log.error(`Error postResultZone JSON.parse: ${error}`);
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
 * @returns {Promise<any>}
 */
function postResult() {
	return new Promise((resolve, reject) => {
		request.get(urlAll.replace('${date}', getFormattedDate(new Date())), (error, res, body) => {
			if (error && res.statusCode !== 200) {
				log.error(`error: ${error}`);
				return reject(error);
			}
			let value = [];
			try {
				value = JSON.parse(body).Data;
			} catch (error) {
				log.error(`Error postResult JSON.parse: ${error}`);
			}
			log.debug('Отработал: Метод для получения расширеных ставок');
			resolve(value);
		});
	});
}

module.exports = {
	getFootball,
	getFootballExpanded,
	postResultZone,
	postResult
};