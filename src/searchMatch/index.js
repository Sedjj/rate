const {log} = require('../utils/logger');
const {newStatistic, setStatistic} = require('../storage/statistic');
const {getAllMatches, getExpandedMatch} = require('../fetch');
const config = require('config');
const {matchRate} = require('../matchRate');
const {waiting} = require('../searchTotal');
const {searchHelper} = require('../modifiableFile');

const active = config.parser.active;
const urlFootballRate = config.get(`parser.${active[0]}.live.football.rate`);
const urlFootballExpandedRate = config.get(`parser.${active[0]}.live.football.expandedRate`);

const before = config.choice.live.football.time.before;
const after = config.choice.live.football.time.after;

const rateStrategyOne = config.choice.live.football.strategyOne.rate;
const rateStrategyTwo = config.choice.live.football.strategyTwo.rate;
const rateStrategyThree = config.choice.live.football.strategyThree.rate;
const rateStrategyFour = config.choice.live.football.strategyFour.rate;
const rateStrategyFive = config.choice.live.football.strategyFive.rate;
const rateStrategySix = config.choice.live.football.strategySix.rate;
const rateStrategySeven = config.choice.live.football.strategySeven.rate;
const typeRate = config.choice.live.football.typeRate;

/**
 * Метод поиска совпадений по данным стратегиям.
 *
 * @returns {*}
 */
function search() {
	getAllMatches(urlFootballRate)
		.then((items) => {
			items.forEach((item) => {
				try {
					footballLiveStrategy(searchHelper['getParams'](item));
				} catch (e) {
					log.debug(`Ошибка при парсинге матча: ${JSON.stringify(item)} error: ${e}`);
				}
			});
		})
		.catch(error => {
			log.error(`search: ${error}`);
		});
}

/**
 * Общая стратегия для Live футбола
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategy(param) {
	if ((param.p1 !== '') && (param.p2 !== '') && (param.x !== '')) {
		if ((param.time >= before) && (param.time <= after)) {
			// тотал больше
			if ((param.score.sc1 + param.score.sc2) === 1) {
				footballLiveStrategyOne(param);
			}
			if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 0)) {
				footballLiveStrategyTwo(param);
			}
			if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 1)) {
				footballLiveStrategyThree(param);
			}
			// тотал меньше
			if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 0)) {
				footballLiveStrategyFour(param);
			}
			if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 0)) {
				footballLiveStrategyFive(param);
			}
			if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 1)) {
				footballLiveStrategySix(param);
			}
			if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 1)) {
				footballLiveStrategySeven(param);
			}
		}
	}
}

/**
 * Стратегия гол лузера
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategyOne(param) {
	if ((Math.abs(param.p1 - param.p2) <= rateStrategyOne)) {
		saveRate(param, 1, -2, 1)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					await setSnapshot(param.matchId, 1);
					log.debug(`Найден ${param.matchId}: Стратегия гол лузера`);
					waiting(param, 1);
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategyOne: ${error.message}`);
			});
	}
}

/**
 * Стратегия ничья с явным фаворитом 0:0
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategyTwo(param) {
	if ((Math.abs(param.p1 - param.p2) > rateStrategyTwo)) {
		if (param.x > Math.min(param.p1, param.p2)) {
			saveRate(param, 2, -2, 1)// пропускает дальше если запись ушла в БД
				.then(async (statistic) => {
					if (statistic !== null) {
						await setSnapshot(param.matchId, 2);
						log.debug(`Найден ${param.matchId}: Стратегия 2`);
						waiting(param, 2);
					}
				})
				.catch((error) => {
					log.error(`footballLiveStrategyTwo: ${error.message}`);
				});
		}
	}
}

/**
 * Стратегия ничья с явным фаворитом 1:1
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategyThree(param) {
	if ((Math.abs(param.p1 - param.p2) > rateStrategyThree)) {
		if (param.x > Math.min(param.p1, param.p2)) {
			saveRate(param, 3, -2, 1)// пропускает дальше если запись ушла в БД
				.then(async (statistic) => {
					if (statistic !== null) {
						await setSnapshot(param.matchId, 3);
						log.debug(`Найден ${param.matchId}: Стратегия 3`);
						waiting(param, 3);
					}
				})
				.catch((error) => {
					log.error(`footballLiveStrategyThree: ${error.message}`);
				});
		}
	}
}

/**
 * Стратегия ничья с явным фаворитом 0:0
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategyFour(param) {
	if ((Math.abs(param.p1 - param.p2) > rateStrategyFour)) {
		saveRate(param, 4, 1, param.x)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					await setSnapshot(param.matchId, 4);
					log.debug(`Найден ${param.matchId}: Стратегия 4`);
					await matchRate(param);
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategyThree: ${error.message}`);
			});
	}
}

/**
 * Стратегия ничья с явным фаворитом 0:0
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategyFive(param) {
	if ((Math.abs(param.p1 - param.p2) > rateStrategyFive)) {
		const total = param.underTotal[typeRate[5]] ? param.underTotal[typeRate[5]] : 1; // TODO проверить что работает
		saveRate(param, 5, total, param.underTotal[typeRate[5]])// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					await setSnapshot(param.matchId, 5);
					log.debug(`Найден ${param.matchId}: Стратегия 5`);
					await matchRate(param);
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategyThree: ${error.message}`);
			});
	}
}

/**
 * Стратегия ничья с явным фаворитом 1:1
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategySix(param) {
	if ((Math.abs(param.p1 - param.p2) > rateStrategySix)) {
		saveRate(param, 6, 1, param.x)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					await setSnapshot(param.matchId, 6);
					log.debug(`Найден ${param.matchId}: Стратегия 6`);
					await matchRate(param);
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategyThree: ${error.message}`);
			});
	}
}

/**
 * Стратегия ничья с явным фаворитом 1:1
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategySeven(param) {
	if ((Math.abs(param.p1 - param.p2) > rateStrategySeven)) {
		const total = param.underTotal[typeRate[7]] ? param.underTotal[typeRate[7]] : 1; // TODO проверить что работает
		saveRate(param, 7, total, param.underTotal[typeRate[7]])// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					await setSnapshot(param.matchId, 7);
					log.debug(`Найден ${param.matchId}: Стратегия 7`);
					await matchRate(param);
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategyThree: ${error.message}`);
			});
	}
}

/**
 * Метод для изменения начальных параметров карточек.
 *
 * @param {number} matchId матча
 * @param {Number} strategy стратегия ставок
 */
async function setSnapshot(matchId, strategy) {
	const item = await getExpandedMatch(urlFootballExpandedRate.replace('${id}', matchId));
	const param = searchHelper['getParams'](item, true);
	return setStatistic({
		matchId: param.matchId,
		strategy: strategy,
		cards: {
			before: param.cards
		},
		modifiedBy: new Date().toISOString()
	});
}


/**
 * Метод для создании записи в бд.
 *
 * @param {Object} param объект с параметрами матча
 * @param {Number} strategy стратегия ставок
 * @param {Number} total коэффициент ставоки
 * @param {Number} index значение ставоки
 * @returns {Promise<any | never>}
 */
function saveRate(param, strategy, total, index) {
	return newStatistic({
		matchId: param.matchId, // id матча
		score: param.score, // счет матча
		command: param.command,
		group: param.group,
		strategy: strategy, // стратегия
		index: index, // результат ставки.
		total: total,
		snapshot: {
			start: {
				time: param.time,
				p1: param.p1,
				x: param.x,
				p2: param.p2,
				mod: Math.abs(param.p1 - param.p2),
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
	search
};