const {getStringToUTCDateString} = require('./../utils/dateFormat');
const config = require('config');

const numericalDesignation = config.choice.live.football.numericalDesignation;

/**
 * Метод для вытаскивания нужных данных из JSON ответа
 *
 * @param {Object} item объект матча
 * @param {Boolean} extended тип парсинга
 * @returns {Object}
 */
function getParams(item, extended = false) {
	let param;
	try {
		const rate = extended ? indexGameExtended(item) : indexGame(item);
		const cards = parserCards(item['SC']);
		param = {
			successfully: true,
			matchId: item['I'],
			command: {
				ru: {
					one: item['O1'], // название команды 1
					two: item['O2']  // название команды 2
				},
				en: {
					one: item['O1E'], // название команды 1 на en
					two: item['O2E']  // название команды 2 на en
				},
				women: parserScoreWomen(item['O1E']),
				youth: parserScoreYouth(item['O1E'])
			},
			group: {
				ru: item['L'],
				en: item['LE']
			},
			p1: rate.p1,
			x: rate.x,
			p2: rate.p2,
			score: scoreGame(item),
			set: setGame(item),
			time: timeGame(item),
			cards: cards
		};

		if (extended) {
			const betting = parserBetting(item['GE']);
			param = {
				...param,
				total: {
					over: betting.total.over,
					under: betting.total.under,
				},
				handicap: {
					over: betting.handicap.over,
					under: betting.handicap.under,
				}
			};
		}
	} catch (error) {
		console.log(error);
	}
	return param;
}

/**
 * Метод для определения счета матча.
 *
 * @param {Object} item объект матча
 * @returns {{sc1: number, sc2: number}}
 */
function scoreGame(item) {
	const rate = {
		sc1: 0,
		sc2: 0
	};
	if (item['SC'] && item['SC']['FS']) {
		if (item['SC']['FS']['S1']) {
			rate.sc1 = item['SC']['FS']['S1'];
		}
		if (item['SC']['FS']['S2']) {
			rate.sc2 = item['SC']['FS']['S2'];
		}
	}
	return rate;
}

/**
 * Метод для определения сета и счета матча.
 *
 * @param {Object} item объект матча
 * @returns {number}
 */
function setGame(item) {
	let set = {
		key: 0,
		value: {
			sc1: 0,
			sc2: 0
		}
	};
	if (item['SC'] && item['SC']['CP']) {
		set.key = item['SC']['CP'];
		if (item['SC']['PS']) {
			item['SC']['PS'].forEach((item) => {
				if (item.Key === set.key){
					set.value.sc1 = item.Value.S1 ? item.Value.S1 : 0;
					set.value.sc2 = item.Value.S2 ? item.Value.S2 : 0;
				}
			});
		}
	}
	return set;
}

/**
 * Метод для определения ставок матча.
 *
 * @param {Object} items объект матча
 * @returns {{p1: number, x: number, p2: number}}
 */
function indexGame(items) {
	const rate = {
		p1: 0,
		x: 0,
		p2: 0,
	};
	if (items['E'] && Array.isArray(items['E'])) {
		items['E'].forEach((item) => {
			switch (item['T']) {
				case 1: // победа первой
					rate.p1 = item['C'];
					break;
				case 2: // ничья
					rate.x = item['C'];
					break;
				case 3: // победа второй
					rate.p2 = item['C'];
					break;
			}
		});
	}
	return rate;
}

/**
 * Метод для определения ставок матча.
 *
 * @param {Object} items объект матча
 * @returns {{p1: number, x: number, p2: number}}
 */
function indexGameExtended(items) {
	const rate = {
		p1: 0,
		x: 0,
		p2: 0,
	}; // TODO не работает парсер
	if (items['GE'] && Array.isArray(items['GE'])) {
		items['GE'].forEach((rate) => {
			if (rate['G'] === 1) { // 1 - p1 x p2
				if (rate.E && Array.isArray(rate.E)) {
					rate['E'].forEach((item) => {
						switch (item[0]['T']) {
							case 1: // победа первой
								rate.p1 = item[0]['C'];
								break;
							case 2: // ничья
								rate.x = item[0]['C'];
								break;
							case 3: // победа второй
								rate.p2 = item[0]['C'];
								break;
						}
					});
				}
			}
		});
	}
	return rate;
}

/**
 * Метод для определения времени матча(в секундах).
 *
 * @param {Object} item объект матча
 * @returns {number}
 */
function timeGame(item) {
	let time = 0;
	if (item['SC']['TS']) {
		time = Math.floor(item['SC']['TS']);
	}
	return time;
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
 * Метод для нахождения женских команд.
 *
 * @param {String} value строка для парсинга
 * @returns {Object | string}
 */
function parserScoreWomen(value) {
	let parserReturn = 0;
	if (value && value.length > 5) {
		parserReturn = value.match(/(?!=\s)\(Women\)/ig);
		return parserReturn ? 1 : 0;
	} else {
		return parserReturn;
	}
}

/**
 * Метод для нахождения молодежных команд.
 *
 * @param {String} value строка для парсинга
 * @returns {number}
 */
function parserScoreYouth(value) {
	let parserReturn = 0;
	if (value && value.length > 5) {
		parserReturn = value.match(/(?!=\s)U\d{2}/ig);
		return parserReturn ? 1 : 0;
	} else {
		return parserReturn;
	}
}

/**
 * Метод для получения всех total текущего матча.
 *
 * @param {Object} item объект матча
 * @returns {{total: {over: Array, under: Array}, handicap: {over: Array, under: Array}}}
 */
function parserBetting(item = []) {
	const betting = {
		total: {
			over: [],
			under: [],
		},
		handicap: {
			over: [],
			under: [],
		}
	};
	item.forEach((rate) => {
		if (rate['G'] === 17 && rate.E) { // 17 - тотал
			// 0 - так как столбец "Тотал больше"
			if (Array.isArray(rate.E[0])) {
				betting.total.over = rate.E[0].map((overTotal) => {
					return {
						key: overTotal['P'] ? Math.abs(overTotal['P']) : 0,
						value: overTotal.C
					};
				});
			}
			// 1 - так как столбец "Тотал меньше"
			if (Array.isArray(rate.E[1])) {
				betting.total.under = rate.E[1].map((underTotal) => {
					return {
						key: underTotal['P'] ? Math.abs(underTotal['P']) : 0,
						value: underTotal.C
					};
				});
			}
		}
		if (rate['G'] === 2 && rate.E) { // 2 - фора
			// 0 - так как столбец "Фора больше"
			if (Array.isArray(rate.E[0])) {
				betting.handicap.over = rate.E[0].map((overHandicap) => {
					return {
						key: overHandicap['P'] ? Math.abs(overHandicap['P']) : 0,
						value: overHandicap.C
					};
				});
			}
			// 1 - так как столбец "Фора меньше"
			if (Array.isArray(rate.E[1])) {
				betting.handicap.under = rate.E[1].map((underHandicap) => {
					return {
						key: underHandicap['P'] ? Math.abs(underHandicap['P']) : 0,
						value: underHandicap.C
					};
				});
			}
		}
	});
	return betting;
}

/**
 * Метод для нахождения ставки в ответе.
 *
 * @param {Object} item объект матча
 * @param {Number} desiredTotal искомый total
 * @param {Number} minimumIndex ожидаемый коэффициент
 * @returns {Promise<Number>}
 */
function searchTotal(item, desiredTotal, minimumIndex) {
	return new Promise((resolve, reject) => {
		try {
			if (item['GE'] && Array.isArray(item['GE'])) {
				item['GE'].forEach((rate) => {
					if (rate['G'] === 17) { // 17 - тотал
						if (rate.E && Array.isArray(rate.E[0])) {
							rate.E[0].forEach((itemTotal) => { // 0 - так как столбец "Тотал больше"
								if (itemTotal['P'] === desiredTotal) {
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
 * Метод для определения карточек матча.
 *
 * @param {Object} item объект матча
 * @returns {Object}
 */
function parserCards(item = []) {
	const cards = {
		one: {
			red: 0,
			attacks: 0,
			danAttacks: 0,
			shotsOn: 0,
			shotsOff: 0
		},
		two: {
			red: 0,
			attacks: 0,
			danAttacks: 0,
			shotsOn: 0,
			shotsOff: 0
		}
	};
	if (item['S'] && Array.isArray(item['S'])) {
		item['S'].forEach((item) => {
			switch (item['Key']) {
				case 'IRedCard1':
					cards.one.red = item['Value'];
					break;
				case 'IRedCard2':
					cards.two.red = item['Value'];
					break;
				case 'Attacks1':
					cards.one.attacks = item['Value'];
					break;
				case 'Attacks2':
					cards.two.attacks = item['Value'];
					break;
				case 'DanAttacks1':
					cards.one.danAttacks = item['Value'];
					break;
				case 'DanAttacks2':
					cards.two.danAttacks = item['Value'];
					break;
				case 'ShotsOn1':
					cards.one.shotsOn = item['Value'];
					break;
				case 'ShotsOn2':
					cards.two.shotsOn = item['Value'];
					break;
				case 'ShotsOff1':
					cards.one.shotsOff = item['Value'];
					break;
				case 'ShotsOff2':
					cards.two.shotsOff = item['Value'];
					break;
			}
		});
	}
	return cards;
}

/**
 * Метод для поиска результата матча.
 *
 * @param {Array} data все матчи на определенный день
 * @param {number} id матча
 * @returns {Promise<void>}
 */
async function searchResult(data, id) {
	return new Promise((resolve, reject) => {
		try {
			data.forEach((item) => {
				if (item.ID === numericalDesignation) {
					item['Elems'].forEach((object) => {
						if (Array.isArray(object['Elems'])) {
							object['Elems'].forEach((Elems) => {
								if (Elems['Head'][0] === id) {
									resolve(Elems['Head'][6]);
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
 * @param {String} date дата
 * @returns {void | string | never}
 */
function replaceUrl(url, date) {
	return url.replace('${date}', getStringToUTCDateString(date));
}

module.exports = {
	getParams,
	parserScore,
	searchTotal,
	replaceUrl,
	searchResult
};