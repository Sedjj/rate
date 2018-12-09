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
 * 		конечный = (исходный счет + typeRate) -> 1
 * 		конечный < (исходный счет + typeRate) -> 0
 * 		конечный > (исходный счет  + typeRate) -> ставка(1.666)
 * }
 * @param {Object} oldScore исходные данные Total
 * @param {Object} endScore результирующие данные Total
 * @param {Number} typeRate тип ставки
 */
function equalsTotal(oldScore, endScore, typeRate) {
	const start = oldScore.sc1 + oldScore.sc1 + typeRate; // FIXME привести к одному виду
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
 * Метод для сравниея счета матча.
 *
 * @param {Object} oldScore исходный счет матча
 * @param {Object} endScore текущий счет матча
 * @returns {boolean}
 */
function equalsScore(oldScore, endScore) {
	return (oldScore.sc1 === oldScore.sc2) && (endScore.sc1 === endScore.sc2);
}

module.exports = {
	equalsScore,
	filterGame,
	equalsTotal
};