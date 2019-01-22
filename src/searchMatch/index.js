const log = require('../utils/logger');
const {CronJob, CronTime} = require('cron');
const rc = require('../utils/random-cron');
const {newStatistic, setStatistic, deleteStatistic} = require('../storage/statistic');
const {getAllMatches, getExpandedMatch} = require('../fetch');
const config = require('config');
const {matchRate} = require('../matchRate');
const {searchHelper} = require('../modifiableFile');
const {equalsScore} = require('../utils/searchHelper');

const active = config.get('parser.active');
const urlFootballRate = config.get(`parser.${active[0]}.live.football.rate`);
const urlFootballExpandedRate = config.get(`parser.${active[0]}.live.football.expandedRate`);

const before = config.get('choice.live.football.time.before');
const after = config.get('choice.live.football.time.after');
const rateStrategyOne = config.get('choice.live.football.strategyOne.rate');
const rateStrategyTwo = config.get('choice.live.football.strategyTwo.rate');
const rateStrategyThree = config.get('choice.live.football.strategyThree.rate');
const totalStrategy = config.get('choice.live.football.total');
const typeRate = config.get('choice.live.football.typeRate');
const waitingInterval = process.env.NODE_ENV === 'development'
	? rc.some('seconds').between(10, 20).generate()
	: rc.some('seconds').between(
		config.get('cron.waitingInterval.before'),
		config.get('cron.waitingInterval.after')
	).generate();

let waitingEndCount = 0;

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
			if ((param.score.sc1 + param.score.sc2) === 1) {
				footballLiveStrategyOne(param);
			}
			if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 0)) {
				footballLiveStrategyTwo(param);
			}
			if ((param.score.sc1 === param.score.sc2) && (param.score.sc1 === 1)) {
				footballLiveStrategyThree(param);
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
					await setSnapshot(param.matchId);
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
						await setSnapshot(param.matchId);
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
						await setSnapshot(param.matchId);
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
 * Метод для мониторинга Total.
 *
 * @param {Object} param объект с параметрами матча
 * @param {Number} strategy стратегия
 */
function waiting(param, strategy) {
	let reboot = false;
	waitingEndCount++;
	log.debug(`Всего в очереди на окончание матча: ${waitingEndCount}`);
	let waitingIntervalJob = new CronJob(waitingInterval, async () => {
		try {
			const indexMatch = await searchIndex(param.matchId, strategy, param.score);
			if (indexMatch !== null) {
				reboot = false;
				log.debug(`Матч ${param.matchId}: total= ${indexMatch}`);
				waitingIntervalJob.stop();
				waitingEndCount--;
				log.debug(`Всего в очереди на окончание матча осталось: ${waitingEndCount}`);
			} else {
				reboot = true;
				waitingIntervalJob.setTime(new CronTime(
					rc.some('seconds').between(
						config.get('cron.waitingInterval.before'),
						config.get('cron.waitingInterval.after')
					).generate()
				));
			}
		} catch (error) {
			reboot = false;
			log.error(`waiting id:${JSON.stringify(param)}, strategy:${strategy}, oldScore:${JSON.stringify(param.score)}`);
			waitingIntervalJob.stop();
			log.debug(`Всего в очереди на окончание матча осталось: ${waitingEndCount}`);
			waitingEndCount--;
		}
	}, () => {
		if (reboot) {
			waitingIntervalJob.start();
		}
	}, true);
}

/**
 * сохраняем матч и проверяем ставки
 *
 * находим ставку с определенным Total = (sc1+sc1+1)
 * если нет Total -> крон на ожидание 2 мин
 *
 * если есть Total - то сравниваем с 1,3 для первой и 1,5 для второй иначе снова ждем
 *
 * если счет изменился то выходим и в бд пишем 1 и не отслеживаем конец матча
 *
 * @param {Number} matchId матча
 * @param {Number} strategy стратегия
 * @param {Object} oldScore старый счет матча
 * @returns {Promise<Number | null>}
 */
async function searchIndex(matchId, strategy, oldScore) {
	try {
		const item = await getExpandedMatch(urlFootballExpandedRate.replace('${id}', matchId));
		let index = null;
		const param = searchHelper['getParams'](item, true);
		if (equalsScore(oldScore, param.score) && (param.time <= after)) { //не изменился ли счет и не вышло ли за ределы время
			const total = param.score.sc1 + param.score.sc2 + typeRate[strategy];
			index = await searchHelper['searchTotal'](item, total, totalStrategy[strategy]);
			if (index !== null) {
				await setTotalRate(index, param);
				setIndexRate(index, param);
			}
		} else {
			setTotalRate(-1, param);
			index = -1;
		}
		return index;
	} catch (error) {
		log.error(`searchIndex id: ${matchId}`);
		deleteStatistic({
			matchId: matchId
		}).then(() => {
			log.debug(`Матч ${matchId} удален`);
		}).catch((errors) => {
			log.error(`deleteStatistic: ${errors.message}`);
		});
		throw new Error(error);
	}
}

/**
 * Метод для изменения начальных параметров карточек.
 *
 * @param {number} matchId матча
 */
async function setSnapshot(matchId) {
	const item = await getExpandedMatch(urlFootballExpandedRate.replace('${id}', matchId));
	const param = searchHelper['getParams'](item, true);
	return setStatistic({
		matchId: param.matchId,
		cards: {
			before: param.cards
		},
		modifiedBy: new Date().toISOString()
	});
}

/**
 * Метод для изменения ставки.
 *
 * @param {Number} index результат ставки
 * @param {Object} param объект с параметрами матча
 */
function setIndexRate(index = 1, param) {
	return setStatistic({
		matchId: param.matchId,
		index: index, // тип ставки.
		cards: {
			after: param.cards
		},
		modifiedBy: new Date().toISOString()
	}).then(async (statistic) => {
		if (statistic !== null) {
			await matchRate(statistic);
		}
	}).catch((error) => {
		log.error(`setTotalRate: ${error.message}`);
		throw new Error(error);
	});
}

/**
 * Метод для изменения ставки.
 *
 * @param {Number} total коэфф ставки
 * @param {Object} param объект с параметрами матча
 */
function setTotalRate(total = -2, param) {
	return setStatistic({
		matchId: param.matchId,
		total: total,
		snapshot: {
			end: {
				time: param.time,
				p1: param.p1,
				x: param.x,
				p2: param.p2,
				mod: Math.abs(param.p1 - param.p2),
			}
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