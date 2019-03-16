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
	const strategy = 1;
	if ((Math.abs(param.p1 - param.p2) <= rateStrategyOne)) {
		saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					await setSnapshot(param.matchId, strategy, -2, 1);
					log.debug(`Найден ${param.matchId}: Стратегия ${strategy}`);
					waiting(param, strategy);
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
	const strategy = 2;
	if ((Math.abs(param.p1 - param.p2) > rateStrategyTwo)) {
		if (param.x > Math.min(param.p1, param.p2)) {
			saveRate(param, strategy)// пропускает дальше если запись ушла в БД
				.then(async (statistic) => {
					if (statistic !== null) {
						await setSnapshot(param.matchId, strategy, -2, 1);
						log.debug(`Найден ${param.matchId}: Стратегия ${strategy}`);
						waiting(param, strategy);
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
	const strategy = 3;
	if ((Math.abs(param.p1 - param.p2) > rateStrategyThree)) {
		if (param.x > Math.min(param.p1, param.p2)) {
			saveRate(param, strategy)// пропускает дальше если запись ушла в БД
				.then(async (statistic) => {
					if (statistic !== null) {
						await setSnapshot(param.matchId, strategy, -2, 1);
						log.debug(`Найден ${param.matchId}: Стратегия ${strategy}`);
						waiting(param, strategy);
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
	const strategy = 4;
	if ((Math.abs(param.p1 - param.p2) > rateStrategyFour)) {
		saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					await setSnapshot(param.matchId, strategy, 1, param.x);
					log.debug(`Найден ${param.matchId}: Стратегия ${strategy}`);
					matchRate({...param, strategy: strategy});
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
	const strategy = 5;
	if ((Math.abs(param.p1 - param.p2) > rateStrategyFive)) {
		saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					await setSnapshot(param.matchId, strategy);
					log.debug(`Найден ${param.matchId}: Стратегия ${strategy}`);
					matchRate({...param, strategy: strategy});
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
	const strategy = 6;
	if ((Math.abs(param.p1 - param.p2) > rateStrategySix)) {
		saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					await setSnapshot(param.matchId, strategy, 1, param.x);
					log.debug(`Найден ${param.matchId}: Стратегия ${strategy}`);
					matchRate({...param, strategy: strategy});
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
	const strategy = 7;
	if ((Math.abs(param.p1 - param.p2) > rateStrategySeven)) {
		saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					await setSnapshot(param.matchId, strategy);
					log.debug(`Найден ${param.matchId}: Стратегия ${strategy}`);
					matchRate({...param, strategy: strategy});
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
 * @param {Number} total коэффициент ставоки
 * @param {Number} index значение ставоки
 * @returns {Promise<Promise<any>|*>}
 */
async function setSnapshot(matchId, strategy, total = undefined, index = undefined) {
	const item = await getExpandedMatch(urlFootballExpandedRate.replace('${id}', matchId));
	const param = searchHelper['getParams'](item, true);
	const desiredTotal = total || param.underTotal.reduce((acc, current) => {
		if (current.key === typeRate[strategy]) {
			acc = current.value;
		}
		return acc;
	}, undefined);
	const desiredIndex = index || param.underTotal.reduce((acc, current) => {
		if (current.key === typeRate[strategy]) {
			acc = current.value;
		}
		return acc;
	}, undefined);
	return setStatistic({
		matchId: param.matchId,
		strategy: strategy,
		total: desiredTotal,
		index: desiredIndex, // результат ставки.
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