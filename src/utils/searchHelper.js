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
	const start = oldScore.sc1 + oldScore.sc1 + typeRate;
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
	return (oldScore.sc1 === endScore.sc1) && (oldScore.sc2 === endScore.sc2);
}

module.exports = {
	equalsScore,
	equalsTotal
};