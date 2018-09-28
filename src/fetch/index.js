const config = require('config');
const request = require('request');
const log = require('./../utils/logger');
const fetch = require('node-fetch');

const urlFootball = config.get('parser.live.football');
const urlAll = config.get('parser.result.all');

/**
 * Get запрос без параметров.
 *
 * @returns {Promise<JSON | void>}
 */
function getFootball() {
	return new Promise((resolve, reject) => {
		request.get(urlFootball, (error, res, body) => {
				if (error && res.statusCode !== 200) {
					log.info('error:' + error);
					return reject(error);
				}
				let value = [];
				try {
					value = JSON.parse(body).Value
				} catch (e) {
					log.info('error JSON.parse:' + e);
					console.error(e);
				}
				resolve(value);
			}
		);
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
			'Params': ['2018-09-28', null, null, null, null, 300],
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
				log.info('error:' + error);
				return reject(error);
			}
			resolve(body);
		});
	});
}

module.exports = {
	getFootball,
	postResult
};