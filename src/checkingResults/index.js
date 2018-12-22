const log = require('../utils/logger');
const {getStatistic, setStatistic} = require('../storage/statistic');
const config = require('config');
const {throttle} = require('../utils/throttle');
const {equalsTotal} = require('../utils/searchHelper');
const {getResultList} = require('../fetch');
const {searchHelper} = require('../modifiableFile');

const active = config.get('parser.active');
const urlAll = config.get(`parser.${active[0]}.result.all`);

const postResultDebounce = throttle(getResultList, 20000);
const typeRate = config.get('choice.live.football.typeRate');


/**
 *  Метод проверки результатов матчей.
 *
 * @returns {Promise<any | never>}
 */
async function checkingResults() {
	const currentDate = new Date(new Date().setHours(23, 0, 0, 59));
	const beforeDate = new Date(new Date().setUTCHours(0, 0, 0, 1));
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
		const beforeData = await postResultDebounce(searchHelper.replaceUrl(urlAll, beforeDate));
		const currentData = await postResultDebounce(searchHelper.replaceUrl(urlAll, currentDate));
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
			let endScore = await searchHelper.serchResult(beforeData, statistic.matchId);
			if (endScore === '') {
				endScore = await searchHelper.serchResult(currentData, statistic.matchId);
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
 * @param {String} endScore строка для парсинга
 * @returns {Promise<void>}
 */
async function baseRecordCorrection(statistic, endScore) {
	log.debug(`Матч ${statistic.matchId}: 'Стратегия ничья с явным фаворитом' - Результат матча ${(endScore !== '') ? endScore : 'не определен'}`);
	const newScore = searchHelper.parserScore(endScore);
	const result = (newScore !== '') ? equalsTotal(statistic.score, newScore, typeRate[statistic.strategy]) : -1;
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