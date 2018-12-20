const {getStringToDateTime} = require('./../utils/dateFormat');
const config = require('config');

const numericalDesignation = config.get('choice.live.football.numericalDesignation');

/**
 * Метод для вытаскивания нужных данных из JSON ответа
 *
 * @param {Object} item объект матча
 */
function getParams(item) {
	const index = indexGame(item);
	return {
		successfully: true,
		matchId: item.I,
		command: {
			ru: {
				one: item.O1, // название команды 1
				two: item.O2  // название команды 2
			},
			en: {
				one: item.O1E, // название команды 1 на en
				two: item.O2E  // название команды 2 на en
			},
			women: 0, // TODO
			youth: 0 // TODO
		},
		group: {
			ru: item.L,
			en: item.LE
		},
		p1: index.p1,
		x: index.x,
		p2: index.p2,
		score: scoreGame(item),
		time: timeGame(item),
		cards: {
			one: {
				red: 0,
				attacks: 0,
				danAttacks: 0
			},
			two: {
				red: 0,
				attacks: 0,
				danAttacks: 0
			}
		}
	};
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
	};
}

/**
 * Метод для определения ставок матча.
 * @param {Object} item объект матча
 * @returns {{p1: number, x: number, p2: number}}
 */
function indexGame(item) {
	return {
		p1: item.E[0] && item.E[0].T === 1 ? item.E[0].C : '', // победа первой
		x: item.E[1] && item.E[1].T === 2 ? item.E[1].C : '', // ничья
		p2: item.E[2] && item.E[2].T === 3 ? item.E[2].C : '' // победа второй
	};
}

/**
 * Метод для определения времени матча(в секундах).
 *
 * @param {Object} item объект матча
 * @returns {number}
 */
function timeGame(item) {
	return item.SC.TS ? Math.floor(item.SC.TS) : 0;
}

/**
 * Метод для нахождения общего счета за 2 тайма.
 *
 * @param {String} value строка для парсинга
 * @returns {Object | string}
 */
function parserScore(value) {
	if (value.length > 12) {
		const score = value.match(/\d\:\d(?=,|\))/ig);
		const scoreOne = score[0] ? score[0].match(/\d/ig) : [0, 0];
		const scoreTwo = score[1] ? score[1].match(/\d/ig) : [0, 0];
		return {
			sc1: parseInt(scoreOne[0]) + parseInt(scoreOne[1]),
			sc2: parseInt(scoreTwo[0]) + parseInt(scoreTwo[1])
		};
	} else {
		return value;
	}
}

/**
 * Метод для нахождения ставки в ответе.
 *
 * @param {Object} item объект матча
 * @param {Number} desiredTotal minimum index
 * @param {Number} minimumIndex минимальный индекс
 * @returns {Promise<Number>}
 */
function searchTotal(item, desiredTotal, minimumIndex) {
	return new Promise((resolve, reject) => {
		try {
			if (item.GE && Array.isArray(item.GE)) {
				item.GE.map((rate) => {
					if (rate.G === 17) { // 17 - тотал
						if (rate.E && Array.isArray(rate.E[0])) {
							rate.E[0].map((itemTotal) => { // 0 - так как столбец "Тотал больше"
								if (itemTotal.P === desiredTotal) {
									if (itemTotal.C > minimumIndex) {
										resolve(itemTotal.C);
									}
								}
							});
						}
					}
				});
			}
			resolve(null);
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Метод для поиска результата матча.
 *
 * @param {Array} data все матчи на определенный день
 * @param {number} id матча
 * @returns {Promise<void>}
 */
async function serchResult(data, id) {
	return new Promise((resolve, reject) => {
		try {
			data.forEach((item) => {
				if (item.ID === numericalDesignation) {
					item.Elems.map((object) => {
						if (Array.isArray(object.Elems)) {
							object.Elems.map((Elems) => {
								if (Elems.Head[0] === parseInt(id)) {
									resolve(Elems.Head[6]);
								}
							});
						}
					});
				}
			});
		} catch (error) {
			reject(error);
		}
		resolve('');
	});
}

/**
 * Метод для подмены url.
 *
 * @param {String} url адрес запроса
 * @param {Date} date дата
 * @returns {void | string | never}
 */
function replaceUrl(url, date) {
	return url.replace('${date}', getStringToDateTime(date));
}

module.exports = {
	getParams,
	parserScore,
	searchTotal,
	replaceUrl,
	serchResult
};