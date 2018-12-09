const {getFormattedDate} = require('../utils/dateFormat');

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
		score: {
			ru: statistic.score.sc1,
			en: statistic.score.sc2,
		},
		command: {
			ru: {
				one: statistic.command.ru.one, // название команды 1
				two: statistic.command.ru.two  // название команды 2
			},
			en: {
				one: statistic.command.en.one, // название команды 1 на en
				two: statistic.command.en.two  // название команды 2 на en
			}
		},
		group: {
			ru: statistic.group.ru,
			en: statistic.group.en,
		},
		index: statistic.index,
		total: statistic.total,
		createdBy: getFormattedDate(statistic.createdBy),
		modifiedBy: getFormattedDate(statistic.modifiedBy)
	};
}

module.exports = {
	mapProps
};