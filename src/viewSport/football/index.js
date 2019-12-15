const {log} = require('../../utils/logger');
const {newStatistic, setStatistic, deleteStatistic} = require('../../storage/football');
const {getExpandedMatch} = require('../../fetch');
const config = require('config');
const {matchRate} = require('../../matchRate');
const {waiting} = require('../../searchTotal');
const {searchHelper} = require('../../modifiableFile');

const active = config.parser.active;
const urlFootballExpandedRate = config.parser[`${active[0]}`].live['football']['expandedRate'];

const time = config.choice.live.football.time;

const rateStrategyOne = config['choice'].live.football.strategyOne.rate;
const rateStrategyTwo = config['choice'].live.football.strategyTwo.rate;
const rateStrategyThree = config['choice'].live.football.strategyThree.rate;
const rateStrategyFour = config['choice'].live.football.strategyFour.rate;
const rateStrategyFive = config['choice'].live.football.strategyFive.rate;
const rateStrategySix = config['choice'].live.football.strategySix.rate;
const rateStrategySeven = config['choice'].live.football.strategySeven.rate;
const typeRate = config['choice'].live.football.typeRate;

/**
 * Общая стратегия для Live футбола
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategy(param) {
	if ((param.p1 !== '') && (param.p2 !== '') && (param.p1 !== 0) && (param.p2 !== 0) && (param.x !== '')) {
		// тотал больше
		if ((param.score.sc1 + param.score.sc2) === 1) {
			if ((param.time >= time[1].before) && (param.time <= time[1].after)) {
				footballLiveStrategyOne(param);
			}
		}
		// тотал больше
		if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 0)) {
			if ((param.time >= time[2].before) && (param.time <= time[2].after)) {
				footballLiveStrategyTwo(param);
			}
		}
		// тотал больше
		if ((param.score.sc1 + param.score.sc2) === 1) {
			if ((param.time >= time[3].before) && (param.time <= time[3].after)) {
				footballLiveStrategyThree(param);
			}
		}
		// тотал меньше
		if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 0)) {
			if ((param.time >= time[4].before) && (param.time <= time[4].after)) {
				footballLiveStrategyFour(param);
			}
		}
		// тотал меньше
		if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 0)) {
			if ((param.time >= time[5].before) && (param.time <= time[5].after)) {
				footballLiveStrategyFive(param);
			}
		}
		// тотал меньше
		if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 0)) {
			if ((param.time >= time[6].before) && (param.time <= time[6].after)) {
				footballLiveStrategySix(param);
			}
		}
		// тотал больше
		if ((param.score.sc1 + param.score.sc2) === 2) {
			if ((param.time >= time[7].before) && (param.time <= time[7].after)) {
				footballLiveStrategySeven(param);
			}
		}
	}
	// тотал больше
	if ((param.score.sc1 > param.score.sc2)) {
		// footballLiveStrategySix(param);
	}
}

/**
 * Стратегия гол лузера
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategyOne(param) {
	/*const strategy = 1;*/
	if (Math.abs(param.p1 - param.p2) < rateStrategyOne) {
		/*saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					log.debug(`Найден ${param.matchId}: Футбол - стратегия ${strategy}`);
					await setSnapshot(param.matchId, strategy, -2, 1);
					waiting(param, strategy);
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategyOne: ${error}`);
			});*/
	}
}

/**
 * Стратегия ничья с явным фаворитом 0:0
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategyTwo(param) {
	// const strategy = 2;
	if (Math.abs(param.p1 - param.p2) < rateStrategyTwo) {
		/*saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					log.debug(`Найден ${param.matchId}: Футбол - стратегия ${strategy}`);
					await setSnapshot(param.matchId, strategy, -2, 1);
					waiting(param, strategy);
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategyTwo: ${error}`);
			});*/
	}
}

/**
 * Стратегия ничья с явным фаворитом 1:1
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategyThree(param) {
	// const strategy = 3;
	if (Math.abs(param.p1 - param.p2) < rateStrategyThree) {
		/*saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					log.debug(`Найден ${param.matchId}: Футбол - стратегия ${strategy}`);
					await setSnapshot(param.matchId, strategy, -2, 1);
					waiting(param, strategy);
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategyThree: ${error}`);
			});*/
	}
}

/**
 * Стратегия ничья с явным фаворитом 0:0
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategyFour(param) {
	const strategy = 4;
	if (Math.abs(param.p1 - param.p2) < rateStrategyFour) {
		saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					log.debug(`Найден ${param.matchId}: Футбол - стратегия ${strategy}`);
					const football = await setSnapshot(param.matchId, strategy);
					await matchRate(football, 'football');
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategyFour: ${error}`);
			});
	}
}

/**
 * Стратегия ничья с явным фаворитом 1:1
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategyFive(param) {
	const strategy = 5;
	if (Math.abs(param.p1 - param.p2) < rateStrategyFive) {
		saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					log.debug(`Найден ${param.matchId}: Футбол - стратегия ${strategy}`);
					const football = await setSnapshot(param.matchId, strategy);
					await matchRate(football, 'football');
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategyFive: ${error}`);
			});
	}
}

/**
 * Стратегия ничья с явным фаворитом 0:1
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategySix(param) {
	const strategy = 6;
	if (Math.abs(param.p1 - param.p2) < rateStrategySix) {
		saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					log.debug(`Найден ${param.matchId}: Футбол - стратегия ${strategy}`);
					const football = await setSnapshot(param.matchId, strategy);
					matchRate(football, 'football');
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategySix: ${error}`);
			});
	}
}

/**
 * Стратегия ничья с явным фаворитом 0:1
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategySeven(param) {
	const strategy = 7;
	if (Math.abs(param.p1 - param.p2) < rateStrategySeven) {
		saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					log.debug(`Найден ${param.matchId}: Футбол - стратегия ${strategy}`);
					const football = await setSnapshot(param.matchId, strategy);
					await matchRate(football, 'football');
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategySeven: ${error}`);
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
	try {
		let item = await getExpandedMatch(urlFootballExpandedRate.replace('${id}', matchId));
		const param = searchHelper['getParams'](item, true);
		const key = param.score.sc1 + param.score.sc2 + typeRate[strategy];
		const desiredTotal = total || param.total.under.reduce((acc, current) => {
			if (current.key === key) {
				acc = current.value;
			}
			return acc;
		}, undefined);
		const desiredIndex = index || param.total.under.reduce((acc, current) => {
			if (current.key === key) {
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
			rate: param.rate,
			bothTeamsToScore: param.bothTeamsToScore,
			modifiedBy: new Date().toISOString()
		});
	} catch (error) {
		log.error(`Set snapshot: ${error}`);
		deleteStatistic({
			matchId: matchId,
			strategy: strategy
		}).then(() => {
			log.debug(`Матч ${matchId} - статегия ${strategy} -> удален`);
		});
		throw new Error(error);
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
				x: param.x,
				p2: param.p2,
				mod: Math.abs(param.p1 - param.p2),
			}
		},
		createdBy: new Date().toISOString(),
		modifiedBy: new Date().toISOString()
	}).catch((error) => {
		log.error(`Save rate: ${error}`);
		throw new Error(error);
	});
}

module.exports = {
	footballLiveStrategy
};