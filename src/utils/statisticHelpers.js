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
		strategy: statistic.strategy,
		index: statistic.index,
		created: statistic.created,
		modified: statistic.modified
	};
}

module.exports = {
	mapProps
};