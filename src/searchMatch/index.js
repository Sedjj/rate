const {log} = require('../utils/logger');
const {newStatistic, setStatistic} = require('../storage/statistic');
const {getAllMatches, getExpandedMatch} = require('../fetch');
const config = require('config');
const {waiting} = require('../searchTotal');
const {searchHelper} = require('../modifiableFile');

const active = config.get('parser.active');
const urlFootballRate = config.get(`parser.${active[0]}.live.football.rate`);
const urlFootballExpandedRate = config.get(`parser.${active[0]}.live.football.expandedRate`);

const largerBefore = config.get('choice.live.football.time.larger.before');
const largerAfter = config.get('choice.live.football.time.larger.after');

const lessBefore = config.get('choice.live.football.time.less.before');
const lessAfter = config.get('choice.live.football.time.less.after');

const rateStrategyOne = config.get('choice.live.football.strategyOne.rate');
const rateStrategyTwo = config.get('choice.live.football.strategyTwo.rate');
const rateStrategyThree = config.get('choice.live.football.strategyThree.rate');
const rateStrategyFour = config.get('choice.live.football.strategyFour.rate');
const rateStrategyFive = config.get('choice.live.football.strategyFive.rate');
const rateStrategySix = config.get('choice.live.football.strategySix.rate');

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
		// тотал больше
		if ((param.time >= largerBefore) && (param.time <= largerAfter)) {
			if ((param.score.sc1 + param.score.sc2) === 1) {
				footballLiveStrategyOne(param);
			}
			if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 0)) {
				footballLiveStrategyTwo(param);
			}
			if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 1)) {
				footballLiveStrategyThree(param);
			}
		} // тотал меньше
		if ((param.time >= lessBefore) && (param.time <= lessAfter)) {
			if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 0)) {
				footballLiveStrategyFour(param);
			}
			if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 0)) {
				footballLiveStrategyFive(param);
			}
			if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 0)) {
				footballLiveStrategySix(param);
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
		saveRate(param, 1)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					await setSnapshot(param.matchId,1);
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
			saveRate(param, 2)// пропускает дальше если запись ушла в БД
				.then(async (statistic) => {
					if (statistic !== null) {
						await setSnapshot(param.matchId,2);
						log.debug(`Найден ${param.matchId}: Стратегия ничья с явным фаворитом  0:0`);
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
			saveRate(param, 3)// пропускает дальше если запись ушла в БД
				.then(async (statistic) => {
					if (statistic !== null) {
						await setSnapshot(param.matchId,3);
						log.debug(`Найден ${param.matchId}: Стратегия ничья с явным фаворитом  1:1`);
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
		if (param.x > Math.min(param.p1, param.p2)) {
			saveRate(param, 4)// пропускает дальше если запись ушла в БД
				.then(async (statistic) => {
					if (statistic !== null) {
						await setSnapshot(param.matchId,4);
						log.debug(`Найден ${param.matchId}: Стратегия ничья с явным фаворитом  0:0`);
						waiting(param, 4);
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
function footballLiveStrategyFive(param) {
	if ((Math.abs(param.p1 - param.p2) > rateStrategyFive)) {
		if (param.x > Math.min(param.p1, param.p2)) {
			saveRate(param, 5)// пропускает дальше если запись ушла в БД
				.then(async (statistic) => {
					if (statistic !== null) {
						await setSnapshot(param.matchId,5);
						log.debug(`Найден ${param.matchId}: Стратегия ничья с явным фаворитом  0:0`);
						waiting(param, 5);
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
function footballLiveStrategySix(param) {
	if ((Math.abs(param.p1 - param.p2) > rateStrategySix)) {
		if (param.x > Math.min(param.p1, param.p2)) {
			saveRate(param, 6)// пропускает дальше если запись ушла в БД
				.then(async (statistic) => {
					if (statistic !== null) {
						await setSnapshot(param.matchId,6);
						log.debug(`Найден ${param.matchId}: Стратегия ничья с явным фаворитом  0:0`);
						waiting(param, 6);
					}
				})
				.catch((error) => {
					log.error(`footballLiveStrategyThree: ${error.message}`);
				});
		}
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
 * @returns {Promise<any | never>}
 */
function saveRate(param, strategy) {
	return newStatistic({
		matchId: param.matchId, // id матча
		score: param.score, // счет матча
		command: param.command,
		group: param.group,
		strategy: strategy, // стратегия
		index: '1', // результат ставки.
		total: '-2',
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