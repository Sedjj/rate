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
 *
 * @param {Object} item объект матча
 * @returns {{sc1: number, sc2: number}}
 */
function indexGame(item) {
	return {
		p1: item.E[0] && item.E[0].T === 1 ? item.E[0].C : '', // попеда первой
		x: item.E[1] && item.E[1].T === 2 ? item.E[1].C : '', // ничья
		p2: item.E[2] && item.E[2].T === 3 ? item.E[2].C : '' // поведа второй
	};
}

/**
 * Метод для определения времени матча(в секундах).
 *
 * @param {Object} item объект матча
 * @returns {{sc1: number, sc2: number}}
 */
function timeGame(item) {
	return item.SC.TS ? Math.floor(item.SC.TS) : 0;
}

/**
 * Метод для отсеивание по названию матча
 *
 * @param {Object} item матч
 * @param {Array} excludeName масив элементов которые нужно исключить из названий команд.
 * @returns {boolean}
 */
function filterGame(item, excludeName) {
	return excludeName.reduce((current, exclude) => {
		if ((item.command.ru.one.indexOf(exclude) === -1) && (item.command.ru.two.indexOf(exclude) === -1)) {
			current = false;
		}// FIXME Посмотреть как парсятся английские имена
		/*if ((item.command.en.one.indexOf(exclude) === -1) && (item.command.en.two.indexOf(exclude) === -1)) {
			current = false;
		}*/
		return current;
	}, true);
}

/**
 * Cравниваем Total 2-x таймов не изменился ли.
 * Eсли изменился то меняем даные в таблице .
 * {
 * 		конечный = (исходный счет + 1) -> 1
 * 		конечный < (исходный счет + 1) -> 0
 * 		конечный > (исходный счет  + 1) -> ставка(1.666)
 * }
 * @param {Object} oldScore исходные данные Total
 * @param {Object} endScore результирующие данные Total
 * @param {Object} typeRate тип ставки
 */
function equalsTotal(oldScore, endScore, typeRate) {
	oldScore = oldScore.split(':');
	const start = +oldScore[0] + +oldScore[1] + +typeRate;
	const end = endScore.sc1 + endScore.sc2;
	if (start === end) {
		return 1;
	} else if (start > end) {
		return 0;
	} else {
		return null;
	}
}

/**
 * Метод для нахождения общего счета за 2 тайма
 *
 * @param {String} value строка для парсинга
 * @returns {Object}
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


module.exports = {
	scoreGame,
	indexGame,
	timeGame,
	filterGame,
	equalsTotal,
	parserScore
};