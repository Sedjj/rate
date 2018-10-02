const log = require('./../utils/logger');
const {newField, setField} = require('./../storage');
const {getFootball, getFootballExpanded} = require('./../fetch');
const config = require('config');

const before = config.get('choice.live.football.time.before');
const after = config.get('choice.live.football.time.after');
const rateStrategyOne = config.get('choice.live.football.strategyOne.rate');
const rateStrategyTwo = config.get('choice.live.football.strategyTwo.rate');
const totalStrategy = config.get('choice.live.football.total');
const score = config.get('choice.live.football.score');

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
		const sc1 = item.SC.FS.S1 ? item.SC.FS.S1 : 0; // проверяем счет матча
		const sc2 = item.SC.FS.S2 ? item.SC.FS.S2 : 0; // проверяем счет матча
		const tm = item.SC.TS ? Math.floor(item.SC.TS / 60) : 0; // проверяем время матча
		if (item.E.length > 2) {
			const p1 = item.E[0] ? item.E[0].C : ''; // попеда первой
			const x = item.E[1] ? item.E[1].C : ''; // ничья
			const p2 = item.E[2] ? item.E[2].C : ''; // поведа второй
			
			if ((item.O1.indexOf('(') === -1) && (item.O2.indexOf('(') === -1) && (item.O1.indexOf('II') === -1) && (item.O2.indexOf('II') === -1)) {
				if ((p1 !== '') && (p2 !== '') && (x !== '')) {
					if ((tm >= before) && (tm >= after)) {
						if (sc1 === sc2) {
							footballLiveStrategyOne(item, p1, p2);
						} else if (sc1 + sc2 === score) {
							footballLiveStrategyTwo(item, p1, p2, x);
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
 * @param {Number} p1 попеда первой
 * @param {Number} p2 поведа второй
 */
function footballLiveStrategyOne(item, p1, p2) {
	if ((Math.abs(p1 - p2) <= rateStrategyOne)) {
		searchIndex(item.I, '1');
	}
}

/**
 * Стратегия ничья с явным фаворитом
 *
 * @param {Array} item массив ставок
 * @param {Number} p1 попеда первой
 * @param {Number} p2 поведа второй
 * @param {Number} x ybxmz
 */
function footballLiveStrategyTwo(item, p1, p2, x) {
	if ((Math.abs(p1 - p2) <= rateStrategyTwo)) {
		if (x > Math.min(p1, p2)) {
			searchIndex(item.I, '2');
		}
	}
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
 * @param id
 * @param strategy
 */
function searchIndex(id, strategy) {
	getFootballExpanded(id)
		.then((item) => {
			saveRate(item, strategy);
			if (item.GE && item.GE.length > 2) {
				
				item.GE.map((rate) => {
					
					if (rate.G === '17') { // 17 - тотал
						
						const sc1 = item.SC.FS.S1 ? item.SC.FS.S1 : 0; // проверяем счет матча
						const sc2 = item.SC.FS.S2 ? item.SC.FS.S2 : 0; // проверяем счет матча
						// const tm = item.SC.TS ? Math.floor(item.SC.TS / 60) : 0; // проверяем время матча
						const total = sc1 + sc2 + 1;
						
						rate.E[0].map((item) => { // 0 - так как столбец "больше"
							if (item.P === total) {
								if (item.C > totalStrategy[strategy]) {
									setRate(id, index);
								} else {
									// ждать 2 мин
								}
							}
							
						})
					}
				})
				
			}
		})
		.catch(error => {
			log.info('error getFootballExpanded ', error);
		});
}

/**
 * Метод для изменения ставки.
 *
 * @param {Number} id матча
 * @param {Number} index коэфф
 */
function setRate(id = 0, index = 1) {
	setField({
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
	newField({
		matchId: item.I, // id матча
		commandOne: item.O1, // название команды 1
		commandTwo: item.O2, // название команды 2
		strategy: strategy, // стратегия
		index: '1' // коэфф.
	});
}

module.exports = {
	search
};