/**
 * Cравниваем Total 2-x таймов не изменился ли.
 * Eсли изменился то меняем даные в таблице .
 * {
 * 		конечный = (исходный счет + typeRate) -> 1
 * 		конечный < (исходный счет + typeRate) -> 0
 * 		конечный > (исходный счет  + typeRate) -> ставка(1.666)
 * }
 * @param {Object} startScore исходные данные Total
 * @param {Object} endScore результирующие данные Total
 * @param {Number} typeRate тип ставки
 * @returns {*}
 */
function equalsTotalOver(startScore, endScore, typeRate) {
	const start = startScore.sc1 + startScore.sc2 + typeRate;
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
 * Cравниваем Total 2-x таймов не изменился ли.
 * Eсли изменился то меняем даные в таблице .
 * {
 * 		конечный = (исходный счет + typeRate) -> 1
 * 		конечный > (исходный счет + typeRate) -> 0
 * 		конечный < (исходный счет  + typeRate) -> ставка(1.666)
 * }
 * @param {Object} startScore исходные данные Total
 * @param {Object} endScore результирующие данные Total
 * @param {Number} typeRate тип ставки
 * @returns {*}
 */
function equalsTotalUnder(startScore, endScore, typeRate) {
	const start = startScore.sc1 + startScore.sc2 + typeRate;
	const end = endScore.sc1 + endScore.sc2;
	if (start === end) {
		return 1;
	} else if (start < end) {
		return 0;
	} else {
		return null;
	}
}

/**
 * Cравниваем Total 2-x таймов не изменился ли.
 * Eсли изменился то меняем даные в таблице .
 *
 * @param {Object} endScore результирующие данные Total
 * @returns {*}
 */
function areEqualTotal(endScore) {
	return endScore.sc1 !== endScore.sc2 ? null : 0;
}

/**
 * Метод для сравниея счета матча.
 *
 * @param {Object} oldScore исходный счет матча
 * @param {Object} endScore текущий счет матча
 * @returns {boolean}
 */
function equalsScore(oldScore, endScore) {
	return (oldScore.sc1 === endScore.sc1) && (oldScore.sc2 === endScore.sc2);
}

/**
 * Метод для получения счета в тенисе.
 *
 * @param {Map} sets результаты в каждом сете
 * @returns {{sc1: number, sc2: number}}
 */
function countScore(sets = []) {
	const score = {
		sc1: 0,
		sc2: 0,
	};
	sets.forEach((value) => {
		if (value.sc1 > value.sc2) {
			score.sc1++;
		} else {
			score.sc2++;
		}
	});
	return score;
}

module.exports = {
	equalsScore,
	areEqualTotal,
	equalsTotalOver,
	equalsTotalUnder,
	countScore
};