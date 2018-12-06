const log = require('../utils/logger');
const {getStatistic, setStatistic} = require('../storage/statistic');
const config = require('config');
const {throttle} = require('../utils/throttle');
const {equalsTotal, parserScore} = require('../utils/searchHelper');
const {postResult} = require('../fetch');

const postResultDebounce = throttle(postResult, 20000);
const typeRate = config.get('choice.live.football.typeRate');
const numericalDesignation = config.get('choice.live.football.numericalDesignation');

/**
 *  Метод проверки результатов матчей.
 *
 * @returns {Promise<any | never>}
 */
async function checkingResults() {
	const currentDate = new Date(new Date().setHours(23, 59, 0, 0));
	const beforeDate = new Date(new Date().setUTCHours(0, 0, 0, 0));
	beforeDate.setDate(beforeDate.getDate() - 1);
	let query = {};
	query['$and'] = [];
	query['$and'].push({createdBy: {$gte: beforeDate.toISOString()}});
	query['$and'].push({createdBy: {$lte: currentDate.toISOString()}});
	log.debug(`Начало проверки результатов с ${beforeDate.toISOString()} по ${currentDate.toISOString()}`);
	return getStatistic(query, ['(', ')'])
		.then((statistics) => {
			return result(statistics, beforeDate.toISOString(), currentDate.toISOString());
		}).catch((error) => {
			log.error(`checkingResults: ${error.message}`);
		});
}

/**
 * Получение данных матчей по 2 датам.
 *
 * @param {Object} statistics объекты матчей
 * @param {Date} beforeDate дата предыдущего дня
 * @param {Date} currentDate дата текущего дня
 * @returns {Promise<void>}
 */
async function result(statistics, beforeDate, currentDate) {
	try {
		const beforeData = await postResultDebounce(beforeDate);
		const currentData = await postResultDebounce(currentDate);
		statistics.forEach(async (statistic) => {
			const endScore = await serchResultEndMatch(beforeData, currentData, statistic);
			await baseRecordCorrection(statistic, endScore);
		});
	} catch (error) {
		log.error(`serchResult: ${error}`);
	}
}

/**
 * Метод нахождения конча матча из базы.
 *
 * @param {Array} beforeData все матчи предыдущего дня
 * @param {Array} currentData все матчи текущего дня
 * @param {Object} statistic объекты матча
 * @returns {Promise<String>}
 */
function serchResultEndMatch(beforeData, currentData, statistic) {
	return new Promise(async (resolve, reject) => {
		try {
			let endScore = await serchResult(beforeData, statistic.matchId);
			if (endScore === '') {
				endScore = await serchResult(currentData, statistic.matchId);
			}
			resolve(endScore);
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Метод для поиска результата матча.
 *
 * @param {Array} data все матчи на определенный день
 * @param {number} id матча
 * @returns {Promise<void>}
 */
async function serchResult(data, id) {
	let score = '';
	try {
		data.forEach((item) => {
			if (item.ID === numericalDesignation) {
				item.Elems.map((object) => {
					if (Array.isArray(object.Elems)) {
						object.Elems.map((Elems) => {
							if (Elems.Head[0] === parseInt(id)) {
								score = Elems.Head[6];
							}
						});
					}
				});
			}
		});
	} catch (error) {
		log.error(`serchResult: ${error}`);
	}
	return score;
}

/**
 * Метод для сравнения результатов.
 *
 * @param {Object} statistic объект матча
 * @param {String} endScore строка для парсинга
 * @returns {Promise<void>}
 */
async function baseRecordCorrection(statistic, endScore) {
	log.debug(`Матч ${statistic.matchId}: 'Стратегия ничья с явным фаворитом' - Результат матча ${(endScore !== '') ? endScore : 'не определен'}`);
	const newScore = parserScore(endScore);
	const result = (newScore !== '') ? equalsTotal(statistic.score, newScore, typeRate[2]) : -1;
	log.debug(`Матч ${statistic.matchId}: 'Стратегия ничья с явным фаворитом' - Коэффициента ставки ${(result !== null) ? result : 'не изменился'}`);
	if (result === 0 || result === 1 || result === -1) {
		log.debug(`Матч ${statistic.matchId}: 'Стратегия ничья с явным фаворитом' - Корректировка коэффициента ставки ${result}`);
		await setIndexRate(statistic.matchId, result);
	}
	return Promise.resolve([]);
}

/**
 * Метод для изменения ставки.
 *
 * @param {Number} id матча
 * @param {Number} index результат ставки
 */
function setIndexRate(id = 0, index = 1) {
	return setStatistic({
		matchId: id,
		index: index, // тип ставки.
	});
}

module.exports = {
	checkingResults
};