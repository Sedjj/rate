const {getDateTime} = require('../utils/dateFormat');

/**
 * Преобразовывает статистику в необходимый формат
 *
 * @param {Object} statistic статистика
 * @param {Number} index текущий элемент
 * @return {Object}
 */
function mapProps(statistic, index) {
	return {
		id: index,
		allMatch: statistic.allMatch,
		strategyOne: statistic.strategyOne,
		strategyTwo_zero: statistic.strategyTwo_zero,
		strategyTwo_one: statistic.strategyTwo_one,
		strategyTwo_two: statistic.strategyTwo_two,
		allMatch_withoutLeagues: statistic.allMatch_withoutLeagues,
		strategyOne_withoutLeagues: statistic.strategyOne_withoutLeagues,
		strategyTwo_zero_withoutLeagues: statistic.strategyTwo_zero_withoutLeagues,
		strategyTwo_one_withoutLeagues: statistic.strategyTwo_one_withoutLeagues,
		strategyTwo_two_withoutLeagues: statistic.strategyTwo_two_withoutLeagues,
		created: getDateTime(statistic.created)
	};
}

module.exports = {
	mapProps
};