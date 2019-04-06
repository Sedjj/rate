const {log} = require('../utils/logger');
const {getStatistic, setStatistic} = require('../storage/football');
const config = require('config');
const {equalsTotalOver, areEqualTotal, equalsTotalUnder} = require('../utils/searchHelper');
const {throttle} = require('../utils/throttle');
const {getResultList} = require('../fetch');
const {searchHelper} = require('../modifiableFile');

const active = config.parser.active;
const urlAll = config.get(`parser.${active[0]}.result.all`);

const postResultDebounce = throttle(getResultList, 20000);
const typeRate = config.choice.live.football.typeRate;


/**
 *  Метод проверки результатов матчей.
 *
 * @returns {Promise<any | never>}
 */
async function checkingResults() {
	const beforeDate = new Date(new Date().setUTCHours(0, 0, 0, 1));
	const currentDate = new Date(new Date().setUTCHours(23, 59, 59, 59));
	beforeDate.setUTCDate(beforeDate.getUTCDate() - 1);
	let query = {};
	query['$and'] = [];
	query['$and'].push({createdBy: {$gte: beforeDate.toISOString()}});
	query['$and'].push({createdBy: {$lte: currentDate.toISOString()}});
	log.debug(`Начало проверки результатов с ${beforeDate.toISOString()} по ${currentDate.toISOString()}`);
	return getStatistic(query)
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
 * @param {String} beforeDate дата предыдущего дня
 * @param {String} currentDate дата текущего дня
 * @returns {Promise<void>}
 */
async function result(statistics, beforeDate, currentDate) {
	try {
		const currentData = await postResultDebounce(searchHelper.replaceUrl(urlAll, currentDate));
		const beforeData = await postResultDebounce(searchHelper.replaceUrl(urlAll, beforeDate));
		statistics.forEach(async (statistic) => {
			const endScore = await serchResultEndMatch(beforeData, currentData, statistic);
			await baseRecordCorrection(statistic, endScore);
		});
	} catch (error) {
		log.error(`searchResult: ${error}`);
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
			let endScore = await searchHelper.searchResult(currentData, statistic.matchId);
			if (endScore === '') {
				endScore = await searchHelper.searchResult(beforeData, statistic.matchId);
			}
			resolve(endScore);
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Метод для сравнения результатов.
 *
 * @param {Object} statistic объект матча
 * @param {String} score строка для парсинга
 * @returns {Promise<void>}
 */
async function baseRecordCorrection(statistic, score) {
	log.debug(`Матч ${statistic.matchId}: 'Стратегия ${statistic.strategy}' - Результат матча ${(score !== '') ? score : 'не определен'}`);
	const endScore = searchHelper.parserScore(score);
	let result = -1;
	if (endScore !== '') {
		switch (statistic.strategy) {
			case 1:
			case 2:
			case 3:
				result = equalsTotalOver(statistic.score, endScore, typeRate[statistic.strategy]);
				break;
			case 4:
			case 6:
				result = areEqualTotal(endScore);
				break;
			case 5:
			case 7:
				result = equalsTotalUnder(statistic.score, endScore, typeRate[statistic.strategy]);
				break;
		}
	}
	log.debug(`Матч ${statistic.matchId}: 'Стратегия ${statistic.strategy}' - Коэффициента ставки ${(result !== null) ? result : 'не изменился'}`);
	if (result === 0 || result === 1 || result === -1) {
		log.debug(`Матч ${statistic.matchId}: 'Стратегия ${statistic.strategy}' - Корректировка коэффициента ставки ${result}`);
		await setIndexRate(statistic.matchId, result, statistic.strategy);
	}
	return Promise.resolve([]);
}

/**
 * Метод для изменения ставки.
 *
 * @param {Number} id матча
 * @param {Number} index результат ставки
 * @param {Number} strategy стратегия ставок
 * @returns {Promise<any>|*}
 */
function setIndexRate(id = 0, index = 1, strategy) {
	return setStatistic({
		matchId: id,
		strategy: strategy,
		index: index, // тип ставки.
	});
}

module.exports = {
	checkingResults
};