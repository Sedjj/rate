const log = require('../utils/logger');
const {decorateMessage} = require('../utils/formateMessage');
const {CronJob} = require('cron');
const {newField, setField} = require('../storage');
const {getFootball, getFootballExpanded, postResult} = require('../fetch');
const config = require('config');
const {sendMessage} = require('../telegramApi');
const {
	scoreGame,
	indexGame,
	timeGame,
	equalsTotal,
	parserScore
} = require('../utils/searchHelper');

const before = config.get('choice.live.football.time.before');
const after = config.get('choice.live.football.time.after');
const rateStrategyOne = config.get('choice.live.football.strategyOne.rate');
const rateStrategyTwo = config.get('choice.live.football.strategyTwo.rate');
const totalStrategy = config.get('choice.live.football.total');
const numericalDesignation = config.get('choice.live.football.numericalDesignation');
const waitingInterval = process.env.NODE_ENV === 'development'
	? '*/20 * * * * *'
	: config.get('cron.waitingInterval');

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
			log.error(`Error search: ${error.message}`);
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
					if (score.sc1 === score.sc2) {
						footballLiveStrategyTwo(item, index);
					} else if (score.sc1 + score.sc2 === score) {
						footballLiveStrategyOne(item, index);
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
		try {
			log.debug(`Найден ${item.I}: Стратегия гол лузера`);
			const oldScore = scoreGame(item);
			if (await saveRate(item, oldScore, '1')) {
				const total = await waiting(item, '1', oldScore);
				if (total !== -1) { // -1 - это время истекло или поменялся счет
					const endScore = await waitingEndMatch(item, '1');
					log.debug(`Матч ${item.I}: 'Стратегия гол лузера' - Результат матча ${endScore}`);
					const result = equalsTotal(oldScore, parserScore(endScore));
					log.debug(`Матч ${item.I}: 'Стратегия гол лузера' - Коэффициента ставки ${result}`);
					if (result === 0 || result === 1) {
						log.debug(`Матч ${item.I}: 'Стратегия гол лузера' - Корректировка коэффициента ставки ${result}`);
						setRate(item.I, result);
					}
				}
			}
		} catch (error) {
			log.error(`Error footballLiveStrategyOne: ${error.message}`);
		}
	}
}

/**
 * Стратегия ничья с явным фаворитом
 *
 * @param {Array} item массив ставок
 * @param {Number} index ставки
 */
async function footballLiveStrategyTwo(item, index) {
	if ((Math.abs(index.p1 - index.p2) > rateStrategyTwo)) {
		if (index.x > Math.min(index.p1, index.p2)) {
			try {
				const oldScore = scoreGame(item);
				if (await saveRate(item, oldScore, '2')) { // пропускает дальше если запись ушла в БД
					log.debug(`Найден ${item.I}: Стратегия ничья с явным фаворитом`);
					const total = await waiting(item, '2', oldScore);
					if (total !== -1) { // -1 - это время истекло или поменялся счет
						const endScore = await waitingEndMatch(item, '2');
						log.debug(`Матч ${item.I}: 'Стратегия ничья с явным фаворитом' - Результат матча ${endScore}`);
						const result = equalsTotal(oldScore, parserScore(endScore));
						log.debug(`Матч ${item.I}: 'Стратегия ничья с явным фаворитом' - Коэффициента ставки ${(result !== null) ? result : 'не изменился'}`);
						if (result === 0 || result === 1) {
							log.debug(`Матч ${item.I}: 'Стратегия ничья с явным фаворитом' - Корректировка коэффициента ставки ${result}`);
							setRate(item.I, result);
						}
					}
				}
			} catch (error) {
				log.error(`Error footballLiveStrategyTwo: ${error.message}`);
			}
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
		try {
			waitingIntervalJob = new CronJob(waitingInterval, async () => {
				const indexMatch = await searchIndex(item.I, strategy, oldScore);
				if (indexMatch !== null) {
					log.debug(`Матч ${item.I}: total= ${indexMatch}`);
					waitingIntervalJob.stop();
					resolve(indexMatch);
				}
			}, null, true);
		} catch (error) {
			waitingIntervalJob.stop();
			log.error(`Error cron waiting: ${error.message}`);
			reject(error);
		}
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
			if (Object.is(JSON.stringify(oldScore), JSON.stringify(score)) && tm <= 4320) { //не изменился ли счет
				if (item.GE && Array.isArray(item.GE)) {
					item.GE.map((rate) => {
						if (rate.G === 17) { // 17 - тотал
							const total = score.sc1 + score.sc2 + 1;
							if (rate.E && Array.isArray(rate.E[0])) {
								rate.E[0].map((itemTotal) => { // 0 - так как столбец "больше"
									if (itemTotal.P === total) {
										if (itemTotal.C > totalStrategy[parseInt(strategy)]) {
											setRate(id, index = itemTotal.C);
										}
									}
								});
							}
						}
					});
				}
			} else {
				return -1;
			}
			return index;
		})
		.catch(error => {
			log.error(`Error searchIndex: ${error.message}`);
			return null;
		});
}

/**
 * Метод для ожидания окончания матча.
 *
 * если нашли нужный то ждем окончания матча 120 мин
 *
 * @param {Array} item массив ставок
 * @returns {Promise<Number>}
 */
function waitingEndMatch(item) {
	const endGame = (7200 - timeGame(item)) * 1000;
	return new Promise((resolve, reject) => {
		try {
			setTimeout(async () => {
				resolve(await serchResult(numericalDesignation, item.I));
			}, endGame);
		} catch (error) {
			log.error(`Error waitingEndMatch: ${error.message}`);
			reject(error);
		}
	});
}

/**
 * Метод для поиска результата матча.
 *
 * @param {number} type соревнования(1 - футбол)
 * @param {number} id матча
 * @returns {Promise<void>}
 */
async function serchResult(type, id) {
	let score = '';
	try {
		const data = await postResult();
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
		log.error(`Error serchResult: ${error.message}`);
	}
	return score;
}

/**
 * Метод для изменения ставки.
 *
 * @param {Number} id матча
 * @param {Number} index коэфф
 */
function setRate(id = 0, index = 1) {
	return setField({
		matchId: id,
		index: index,
		modified: new Date()
	});
}

/**
 * Метод для создании записи в бд.
 *
 * @param {Object} item объект матча
 * @param {Object} score счет матча
 * @param {String} strategy стратегия ставок
 * @returns {Promise<boolean | never>}
 */
function saveRate(item = {}, score, strategy) {
	return newField({
		matchId: item.I, // id матча
		score: `${score.sc1}:${score.sc1}`, // счет матча
		commandOne: item.O1, // название команды 1
		commandTwo: item.O2, // название команды 2
		strategy: strategy, // стратегия
		index: '1' // коэфф.
	}).then((statistic) => {
		let status = false;
		if (statistic !== null) {
			sendMessage(decorateMessage(statistic));
			status = true;
		}
		return status;
	}).catch((error) => {
		log.error(`Error saveRate: ${error.message}`);
		return false;
	});
}

module.exports = {
	search
};