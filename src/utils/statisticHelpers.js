/**
 * Преобразовывает статистику в необходимый формат
 *
 * @param {Object} statistic статистика
 * @return {Object}
 */
function mapProps(statistic) {
	return {
		id: statistic.id,
		matchId: statistic.matchId,
		commandOne: statistic.commandOne,
		commandTwo: statistic.commandTwo,
		strategy: statistic.strategy,
		index: statistic.index
	};
}

module.exports = {
	mapProps
};