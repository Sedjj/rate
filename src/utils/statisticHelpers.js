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
		matchId: statistic.matchId,
		score: statistic.score,
		commandOne: statistic.commandOne,
		commandTwo: statistic.commandTwo,
		index: statistic.index,
		created: getDateTime(statistic.created),
		modified: getDateTime(statistic.modified)
	};
}

module.exports = {
	mapProps
};