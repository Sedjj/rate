const {log} = require('../../utils/logger');
const {newStatistic} = require('../../storage/tableTennis');
/*const config = require('config');*/
/*const {matchRate} = require('../../matchRate');*/

/*const set = config.choice.live.tableTennis.set;*/
/*const rateStrategyTwo = config.choice.live.tableTennis.strategyTwo.rate;*/

/**
 * Общая стратегия для Live футбола
 *
 * @param {Object} param объект с параметрами матча
 */
function tableTennisLiveStrategy(param) {
	if ((param.p1 !== '') && (param.p2 !== '') && (param.p1 !== 0) && (param.p2 !== 0)) {
		if ((param.score.sc1 + param.score.sc2) === 0) {
			tableTennisLiveStrategyOne(param);
		}
	}
}

/**
 * Стратегия 1
 *
 * @param {Object} param объект с параметрами матча
 */
function tableTennisLiveStrategyOne(param) {
	const strategy = 1;
	if (param.group.en === 'Pro League. Moscow') {
		saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					log.debug(`Найден ${param.matchId}: Настольный тенис - стратегия ${strategy}`);
					// matchRate({...param, strategy}, 'tennis');
				}
			})
			.catch((error) => {
				log.error(`tableTennisLiveStrategyOne: ${error.message}`);
			});
	}
}

/**
 * Метод для создании записи в бд.
 *
 * @param {Object} param объект с параметрами матча
 * @param {Number} strategy стратегия ставок
 * @returns {Promise<any | never>}
 */
function saveRate(param, strategy) {
	return newStatistic({
		matchId: param.matchId, // id матча
		score: param.score, // счет матча
		command: param.command,
		group: param.group,
		strategy: strategy, // стратегия
		snapshot: {
			start: {
				time: param.time,
				p1: param.p1,
				p2: param.p2
			}
		},
		createdBy: new Date().toISOString(),
		modifiedBy: new Date().toISOString()
	}).catch((error) => {
		log.error(`saveRate: ${error.message}`);
		throw new Error(error);
	});
}

module.exports = {
	tableTennisLiveStrategy
};