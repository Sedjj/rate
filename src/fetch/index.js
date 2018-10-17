const config = require('config');
const request = require('request');
const log = require('./../utils/logger');
const {getFormattedDate} = require('./../utils/dateFormat');

const urlFootballRate = config.get('parser.live.football.rate');
const urlFootballExpandedRate = config.get('parser.live.football.expandedRate');
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
				log.error('error:' + error);
				return reject(error);
			}
			let value = [];
			try {
				value = JSON.parse(body).Value;
			} catch (error) {
				log.error('error Football JSON.parse:' + error);
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
				log.error('error:' + error);
				return reject(error);
			}
			let value = [];
			try {
				value = JSON.parse(body).Value;
			} catch (error) {
				log.error('error Expanded JSON.parse:' + error);
			}
			log.debug('Отработал: Метод для получения расширеных ставок');
			resolve(value);
		});
	});
}

/**
 * Метод для получения всех результатов
 *
 * @returns {Promise<JSON | void>}
 */
function postResult() {
	return new Promise((resolve, reject) => {
		const param = {
			'Language': 'ru',
			'Params': [getFormattedDate(new Date()), null, null, null, null, 300],
			'Vers': 6,
			'Adult': false,
			'partner': 51
		};
		request({
			url: urlAll,
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			json: param
		}, (error, res, body) => {
			if (error) {
				log.error('postResult error:' + error);
				return reject(error);
			}
			log.debug('Отработал: Метод для получения всех результатов');
			resolve(body.Data);
		});
	});
}

module.exports = {
	getFootball,
	getFootballExpanded,
	postResult
};