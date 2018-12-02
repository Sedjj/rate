const log = require('../utils/logger');
const {CronJob} = require('cron');
const {newStatistic, setStatistic, deleteStatistic} = require('../storage/statistic');
const {getFootball, getFootballExpanded} = require('../fetch');
const config = require('config');
const {matchRate} = require('../matchRate');
const {
	scoreGame,
	indexGame,
	timeGame
} = require('../utils/searchHelper');

const before = config.get('choice.live.football.time.before');
const after = config.get('choice.live.football.time.after');
const rateStrategyOne = config.get('choice.live.football.strategyOne.rate');
const rateStrategyTwo = config.get('choice.live.football.strategyTwo.rate');
const totalStrategy = config.get('choice.live.football.total');
const typeRate = config.get('choice.live.football.typeRate');
const waitingInterval = process.env.NODE_ENV === 'development'
	? '*/20 * * * * *'
	: config.get('cron.waitingInterval');

let waitingEndCount = 0;

/**
 * Метод поиска совпадений по данным стратегиям.
 *
 * @returns {*}
 */
function search() {
	getFootball()
		.then((item) => {
			item.map((item) => {
				footballLiveStrategy(item);
			});
		})
		.catch(error => {
			log.error(`search: ${error.message}`);
		});
}

/**
 * Общая стратегия для Live футбола
 *
 * @param {Array} item массив ставок
 */
function footballLiveStrategy(item) {
	if (item.SC && item.SC.FS && item.E && item.SC.TS) {
		const score = scoreGame(item);
		const tm = timeGame(item);// проверяем время матча
		if (Array.isArray(item.E)) {
			const index = indexGame(item);
			if ((index.p1 !== '') && (index.p2 !== '') && (index.x !== '')) {
				if ((tm >= before) && (tm <= after)) {
					if (score.sc1 + score.sc2 === 1) {
						footballLiveStrategyOne(item, index);
					} else if (score.sc1 === score.sc2 && score.sc1 < 2) {
						footballLiveStrategyTwo(item, index);
					}
				}
			}
		}
	}
}

/**
 * Стратегия гол лузера
 *
 * @param {Array} item массив ставок
 * @param {Number} index ставки
 */
function footballLiveStrategyOne(item, index) {
	if ((Math.abs(index.p1 - index.p2) <= rateStrategyOne)) {
		const oldScore = scoreGame(item);
		saveRate(item, oldScore, '1')// пропускает дальше если запись ушла в БД
			.then((statistic) => {
				if (statistic !== null) {
					log.debug(`Найден ${item.I}: Стратегия гол лузера`);
					waiting(item, '1', oldScore);
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategyOne: ${error.message}`);
			});
	}
}

/**
 * Стратегия ничья с явным фаворитом
 *
 * @param {Array} item массив ставок
 * @param {Number} index ставки
 */
function footballLiveStrategyTwo(item, index) {
	if ((Math.abs(index.p1 - index.p2) > rateStrategyTwo)) {
		if (index.x > Math.min(index.p1, index.p2)) {
			const oldScore = scoreGame(item);
			saveRate(item, oldScore, '2')// пропускает дальше если запись ушла в БД
				.then((statistic) => {
					if (statistic !== null) {
						log.debug(`Найден ${item.I}: Стратегия ничья с явным фаворитом`);
						waiting(item, '2', oldScore);
					}
				})
				.catch((error) => {
					log.error(`footballLiveStrategyTwo: ${error.message}`);
				});
		}
	}
}

/**
 * Метод для мониторинга Total.
 *
 * @param {Array} item массив ставок
 * @param {string} strategy стратегия
 * @param {Object} oldScore старый счет матча
 * @returns {Promise<Number>}
 */
function waiting(item, strategy, oldScore) {
	let waitingIntervalJob;
	return new Promise((resolve, reject) => {
		waitingEndCount++;
		log.debug(`Всего в очереди на окончание матча: ${waitingEndCount}`);
		waitingIntervalJob = new CronJob(waitingInterval, async () => {
			try {
				const indexMatch = await searchIndex(item.I, strategy, oldScore);
				if (indexMatch !== null) {
					log.debug(`Матч ${item.I}: total= ${indexMatch}`);
					waitingIntervalJob.stop();
					waitingEndCount--;
					log.debug(`Всего в очереди на окончание матча осталось: ${waitingEndCount}`);
					resolve(indexMatch);
				}
			} catch (error) {
				log.error(`waiting id:${JSON.stringify(item)}, strategy:${strategy}, oldScore:${JSON.stringify(oldScore)}`);
				waitingIntervalJob.stop();
				log.debug(`Всего в очереди на окончание матча осталось: ${waitingEndCount}`);
				waitingEndCount--;
				reject(error);
			}
		}, null, true);
	});
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
 * @param {number} id матча
 * @param {string} strategy стратегия
 * @param {Object} oldScore старый счет матча
 */
function searchIndex(id, strategy, oldScore) {
	return getFootballExpanded(id)
		.then((item) => {
			let index = null;
			const score = scoreGame(item); // счета матча
			const tm = timeGame(item); // проверяем время матча
			if (Object.is(JSON.stringify(oldScore), JSON.stringify(score)) && tm <= after) { //не изменился ли счет
				if (item.GE && Array.isArray(item.GE)) {
					item.GE.map((rate) => {
						if (rate.G === 17) { // 17 - тотал
							const total = score.sc1 + score.sc2 + typeRate[parseInt(strategy)];
							if (rate.E && Array.isArray(rate.E[0])) {
								rate.E[0].map((itemTotal) => { // 0 - так как столбец "больше"
									if (itemTotal.P === total) {
										if (itemTotal.C > totalStrategy[parseInt(strategy)]) {
											setIndexRate(id, index = itemTotal.C);
											setTotalRate(id, index = itemTotal.C);
										}
									}
								});
							}
						}
					});
				}
			} else {
				setTotalRate(id, -1);
				return -1;
			}
			return index;
		})
		.catch(error => {
			log.error(`searchIndex id: ${id}`);
			deleteStatistic({
				matchId: id
			}).then(() => {
				log.debug(`Матч ${id} удален`);
			}).catch((error) => {
				log.error(`deleteStatistic: ${error.message}`);
			});
			throw new Error(error);
		});
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
 * @param {Number} id матча
 * @param {Number} total коэфф ставки
 */
function setTotalRate(id = 0, total = -2) {
	return setStatistic({
		matchId: id,
		total: total,
		modifiedBy: new Date().toISOString()
	});
}

/**
 * Метод для создании записи в бд.
 *
 * @param {Object} item объект матча
 * @param {Object} score счет матча
 * @param {String} strategy стратегия ставок
 * @returns {Promise<any | never>}
 */
function saveRate(item = {}, score, strategy) {
	return newStatistic({
		matchId: item.I, // id матча
		score: `${score.sc1}:${score.sc2}`, // счет матча
		command: {
			ru: {
				one: item.O1, // название команды 1
				two: item.O2  // название команды 2
			},
			en: {
				one: item.O1E, // название команды 1 на en
				two: item.O2E  // название команды 2 на en
			}
		},
		group: {
			ru: item.L,
			en: item.LE
		},
		strategy: strategy, // стратегия
		index: '1', // результат ставки.
		total: '-2',
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