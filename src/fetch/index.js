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
				log.info('error:' + error);
				return reject(error);
			}
			let value = [];
			try {
				value = JSON.parse(body).Value;
			} catch (e) {
				log.info('error Football JSON.parse:' + e);
			}
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
				log.info('error:' + error);
				return reject(error);
			}
			let value = [];
			try {
				value = JSON.parse(body).Value;
			} catch (e) {
				log.info('error Expanded JSON.parse:' + e);
			}
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
				log.info('postResult error:' + error);
				return reject(error);
			}
			resolve(body.Data);
		});
	});
}

module.exports = {
	getFootball,
	getFootballExpanded,
	postResult
};