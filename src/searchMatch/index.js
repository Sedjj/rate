const log = require('./../utils/logger');
const {CronJob} = require('cron');
const {newField, setField} = require('./../storage');
const {getFootball, getFootballExpanded, postResult} = require('./../fetch');
const config = require('config');

const before = config.get('choice.live.football.time.before');
const after = config.get('choice.live.football.time.after');
const rateStrategyOne = config.get('choice.live.football.strategyOne.rate');
const rateStrategyTwo = config.get('choice.live.football.strategyTwo.rate');
const totalStrategy = config.get('choice.live.football.total');
const score = config.get('choice.live.football.score');
const numericalDesignation = config.get('choice.live.football.numericalDesignation');
const waitingInterval = process.env.NODE_ENV === 'development'
	? '* /02 * * * *'
	: config.get('cron.waitingInterval');

/**
 * Поиск совпадений по данным стратегиям
 *
 * @returns {*}
 */
function search() {
	getFootball()
		.then((item) => {
			item.map((item) => {
				footballLiveStrategy(item);
			});
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
		const tm = item.SC.TS ? Math.floor(item.SC.TS / 60) : 0; // проверяем время матча
		if (item.E.length > 2) {
			const index = indexGame(item);
			if ((item.O1.indexOf('(') === -1) && (item.O2.indexOf('(') === -1) && (item.O1.indexOf('II') === -1) && (item.O2.indexOf('II') === -1)) {
				if ((index.p1 !== '') && (index.p2 !== '') && (index.x !== '')) {
					if ((tm >= before) && (tm >= after)) {
						if (score.sc1 === score.sc2) {
							footballLiveStrategyOne(item, index);
						} else if (score.sc1 + score.sc2 === score) {
							footballLiveStrategyTwo(item, index);
						}
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
async function footballLiveStrategyOne(item, index) {
	if ((Math.abs(index.p1 - index.p2) <= rateStrategyOne)) {
		await saveRate(item, '1');
		await waiting(item, '1');
	}
}

/**
 * Стратегия ничья с явным фаворитом
 *
 * @param {Array} item массив ставок
 * @param {Number} index ставки
 */
async function footballLiveStrategyTwo(item, index) {
	if ((Math.abs(p1 - p2) <= rateStrategyTwo)) {
		if (index.x > Math.min(index.p1, index.p2)) {
			await saveRate(item, '2');
			await waiting(item, '2');
		}
	}
}

/**
 * Метод для мониторинга Total.
 *
 * @param item
 * @param strategy
 * @returns {Promise<any>}
 */
function waiting(item, strategy) {
	let waitingIntervalJob;
	return new Promise((resolve, reject) => {
		try {
			waitingIntervalJob = new CronJob(waitingInterval, async () => {
				const indexMatch = await searchIndex(item.I, strategy);
				if (indexMatch !== null) {
					waitingIntervalJob.stop();
					resolve(indexMatch);
				}
			}, null, true);
		} catch (ex) {
			waitingIntervalJob.stop();
			console.log('cron waiting error ', ex);
			reject(ex);
		}
	});
}

/**
 * Метод для ожидания окончания матча.
 *
 * @param item
 * @param strategy
 * @returns {Promise<any>}
 */
function waitingEndMatch(item, strategy) {
	let waitingEndMatch;
	return new Promise((resolve, reject) => {
		try {
			waitingEndMatch = new CronJob('* /02 * * * *', async () => {
				const result = await serchResult(numericalDesignation, item.I);
				if (result !== null) {
					waitingEndMatch.stop();
					resolve(result);
				}
			}, null, true);
		} catch (ex) {
			waitingEndMatch.stop();
			console.log('cron waiting error ', ex);
			reject(ex);
		}
	});
}

/**
 * Метод для поиска результата матча.
 *
 * @param {number} type соревнования
 * @param {number} id матча
 * @returns {Promise<void>}
 */
async function serchResult(type, id) {
	const data = await postResult();
	let score = null;
	data.forEach((item) => {
		if (item.ID === type) {
			item.Elems.map((object) => {
				if (object.Elems.length > 0) {
					if (object.Elems[0].Head[0] === id) {
						score = object.Elems[0].Head[6];
					}
				}
			});
		}
	});
	return score;
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
 * если нашли нужный то ждем окончания матча 120 мин и сравниваем Total 2-x таймов не изменился ли
 * если изменился то меняем даные в таблице {
 * 		x = исходного -> 1
 * 		x < исходного -> 0
 * 		x > исходного -> ставка
 * }
 *
 * @param {number} id матча
 * @param {string} strategy cnhfntubz
 */
function searchIndex(id, strategy) {
	return getFootballExpanded(id)
		.then((item) => {
			let index = null;
			if (item.GE && item.GE.length > 2) {
				item.GE.map((rate) => {
					if (rate.G === '17') { // 17 - тотал
						const score = scoreGame();
						// const tm = item.SC.TS ? Math.floor(item.SC.TS / 60) : 0; // проверяем время матча
						const total = score.sc1 + score.sc2 + 1;
						rate.E[0].map((item) => { // 0 - так как столбец "больше"
							if (item.P === total) {
								if (item.C > totalStrategy[strategy]) {
									debugger;
									setRate(id, index = item.C);
								} else {
									// ждать 2 мин
								}
							} else {
								// ждать 2 мин
							}
						})
					} else {
						// ждать 2 мин
					}
				})
			} else {
				// ждать 2 мин
			}
			return index;
		})
		.catch(error => {
			log.info('error getFootballExpanded ', error);
		});
}

/**
 * Метод для определения счета матча.
 *
 * @param {Object} item объект матча
 * @returns {{sc1: number, sc2: number}}
 */
function scoreGame(item) {
	return {
		sc1: item.SC.FS.S1 ? item.SC.FS.S1 : 0, // проверяем счет матча
		sc2: item.SC.FS.S2 ? item.SC.FS.S2 : 0 // проверяем счет матча
	}
}

/**
 * Метод для определения ставок матча.
 *
 * @param {Object} item объект матча
 * @returns {{sc1: number, sc2: number}}
 */
function indexGame(item) {
	return {
		p1: item.E[0] ? item.E[0].C : '', // попеда первой
		x: item.E[1] ? item.E[1].C : '', // ничья
		p2: item.E[2] ? item.E[2].C : '' // поведа второй
	}
}

/**
 * Метод для изменения ставки.
 *
 * @param {Number} id матча
 * @param {Number} index коэфф
 */
function setRate(id = 0, index = 1) {
	debugger;
	return setField({
		matchId: id,
		index: index
	});
}

/**
 * Метод для создании записи в бд.
 *
 * @param {Object} item объект матча
 * @param {String} strategy стратегия ставок
 */
function saveRate(item = {}, strategy) {
	return newField({
		matchId: item.I, // id матча
		commandOne: item.O1, // название команды 1
		commandTwo: item.O2, // название команды 2
		strategy: strategy, // стратегия
		index: '1' // коэфф.
	});
}

module.exports = {
	search,
	serchResult
};