const {log} = require('../utils/logger');
const config = require('config');
const {throttle} = require('../utils/throttle');
const {getResultList} = require('../fetch');
const {searchHelper} = require('../modifiableFile');

const active = config.parser.active;
const urlAll = config.get(`parser.${active[0]}.result.all`);

const postResultDebounce = throttle(getResultList, 20000);

/**
 *  Метод проверки результатов матчей.
 *
 * @param {number} getStatistic получить записи из таблицы статистика.
 * @param {number} setStatistic редактирование записи в таблице.
 * @param {number} numericalDesignation числовое обозначение типа матча
 * @returns {Promise<any | never>}
 */
async function checkingResults(getStatistic, setStatistic, numericalDesignation) {
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
			return result(statistics, beforeDate.toISOString(), currentDate.toISOString(), setStatistic, numericalDesignation);
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
 * @param {number} setStatistic редактирование записи в таблице.
 * @param {number} numericalDesignation числовое обозначение типа матча
 * @returns {Promise<void>}
 */
async function result(statistics, beforeDate, currentDate, setStatistic, numericalDesignation) {
	try {
		const currentData = await postResultDebounce(searchHelper.replaceUrl(urlAll, currentDate));
		const beforeData = await postResultDebounce(searchHelper.replaceUrl(urlAll, beforeDate));
		statistics.forEach(async (statistic) => {
			const endScore = await serchResultEndMatch(beforeData, currentData, statistic, numericalDesignation);
			await baseRecordCorrection(setStatistic, statistic, endScore);
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
 * @param {number} numericalDesignation числовое обозначение типа матча
 * @returns {Promise<String>}
 */
function serchResultEndMatch(beforeData, currentData, statistic, numericalDesignation) {
	return new Promise(async (resolve, reject) => {
		try {
			let endScore = await searchHelper.searchResult(currentData, statistic.matchId, numericalDesignation);
			if (endScore === '') {
				endScore = await searchHelper.searchResult(beforeData, statistic.matchId, numericalDesignation);
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
 * @param {number} setStatistic редактирование записи в таблице.
 * @param {Object} statistic объект матча
 * @param {String} score строка для парсинга
 * @returns {Promise<void>}
 */
async function baseRecordCorrection(setStatistic, statistic, score) {
	log.debug(`Матч ${statistic.matchId}: 'Стратегия ${statistic.strategy}' - Результат матча ${(score !== '') ? score : 'не определен'}`);
	await setStatistic({
		matchId: statistic.matchId,
		strategy: statistic.strategy,
		score: {
			resulting: score !== '' ? score : '-1'
		}
	});
	return Promise.resolve([]);
}

module.exports = {
	checkingResults
};