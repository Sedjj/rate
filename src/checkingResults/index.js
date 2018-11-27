const log = require('../utils/logger');
const {getStatistic, setStatistic} = require('../storage/statistic');
const config = require('config');
const {equalsTotal, parserScore} = require('../utils/searchHelper');
const {postResult} = require('../fetch');

const typeRate = config.get('choice.live.football.typeRate');
const numericalDesignation = config.get('choice.live.football.numericalDesignation');

/**
 *  Метод проверки результатов матчей.
 *
 * @returns {Promise<any | never>}
 */
async function checkingResults() {
	const beforeDate = new Date();
	beforeDate.setDate(beforeDate.getDate() - 2);
	let query = {};
	query['$and'] = [];
	query['$and'].push({modifiedBy: {$gte: beforeDate.toISOString()}});
	query['$and'].push({modifiedBy: {$lte: (new Date()).toISOString()}});
	log.debug(`Начало проверки результатов с ${beforeDate.toISOString()} по ${(new Date()).toISOString()}`);
	return getStatistic(query, ['(', ')'])
		.then((statistics) => {
			statistics && statistics.map(async (statistic) => {
				const endScore = await serchResultEndMatch(statistic);
				await baseRecordCorrection(statistic, endScore);
			});
		}).catch((error) => {
			log.error(`checkingResults: ${error.message}`);
		});
}

/**
 * Метод нахождения конча матча из базы.
 *
 * @param {Object} statistic объект матча
 * @returns {Promise<String>}
 */
function serchResultEndMatch(statistic) {
	return new Promise(async (resolve, reject) => {
		try {
			let endScore = '';
			endScore = await serchResult(numericalDesignation, statistic.id, statistic.modifiedBy);
			if (endScore === '') { // если на дату модификаций не нашли матча то ищем на дату создания
				log.debug(`Матч ${statistic.id}: доп. запрос на результат`);
				endScore = await serchResult(numericalDesignation, statistic.id, new Date(statistic.createdBy));
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
 * @param {number} type соревнования(1 - футбол)
 * @param {number} id матча
 * @param {Date} date - дата
 * @returns {Promise<void>}
 */
async function serchResult(type, id, date) {
	let score = '';
	try {
		const data = await postResult(date);
		data.forEach((item) => {
			if (item.ID === type) {
				item.Elems.map((object) => {
					if (Array.isArray(object.Elems)) {
						object.Elems.map((Elems) => {
							if (Elems.Head[0] === id) {
								score = Elems.Head[6];
							}
						});
					}
				});
			}
		});
	} catch (error) {
		throw new Error(error);
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
	log.debug(`Матч ${statistic.id}: 'Стратегия ничья с явным фаворитом' - Результат матча ${(endScore !== '') ? endScore : 'не определен'}`);
	const newScore = parserScore(endScore);
	const result = (newScore !== '') ? equalsTotal(statistic.score, newScore, typeRate[2]) : -1;
	log.debug(`Матч ${statistic.id}: 'Стратегия ничья с явным фаворитом' - Коэффициента ставки ${(result !== null) ? result : 'не изменился'}`);
	if (result === 0 || result === 1 || result === -1) {
		log.debug(`Матч ${statistic.id}: 'Стратегия ничья с явным фаворитом' - Корректировка коэффициента ставки ${result}`);
		setIndexRate(statistic.id, result);
	}
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
		modifiedBy: new Date().toISOString()
	});
}

module.exports = {
	checkingResults
};