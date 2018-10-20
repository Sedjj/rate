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
		p1: item.E[0] && item.E[0].T == 1 ? item.E[0].C : '', // попеда первой
		x: item.E[1] && item.E[1].T == 2 ? item.E[1].C : '', // ничья
		p2: item.E[2] && item.E[2].T == 3 ? item.E[2].C : '' // поведа второй
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
 * @param {Object} itemOne первая команда
 * @param {Object} itemTwo вторая команда
 * @returns {boolean}
 */
function filterGame(itemOne, itemTwo) {
	return (itemOne.indexOf('(') === -1) && (itemTwo.indexOf('(') === -1) && (itemOne.indexOf('II') === -1) && (itemTwo.indexOf('II') === -1) ? true : false;
}

/**
 * Cравниваем Total 2-x таймов не изменился ли.
 * Eсли изменился то меняем даные в таблице .
 * {
 * 		x = исходного -> 1
 * 		x < исходного -> 0
 * 		x > исходного -> ставка
 * }
 * @param {Object} oldScore исходные данные Total
 * @param {Object} endScore результирующие данные Total
 */
function equalsTotal(oldScore, endScore) {
	const start = oldScore.sc1 + oldScore.sc2;
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
	const score = value.match('/\\d\\:\\d(?=,|\\))/g');
	const scoreOne = score[0].match('/\\d/g');
	const scoreTwo = score[1].match('/\\d/g');
	return {
		sc1: scoreOne[0] + scoreOne[1],
		sc2: scoreTwo[0] + scoreTwo[1]
	};
}


module.exports = {
	scoreGame,
	indexGame,
	timeGame,
	filterGame,
	equalsTotal,
	parserScore
};