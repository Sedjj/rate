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
			},
			women: statistic.command.women,
			youth: statistic.command.youth
		},
		group: {
			ru: statistic.group.ru,
			en: statistic.group.en,
		},
		index: statistic.index,
		total: statistic.total,
		snapshot: {
			start: {
				time: statistic.snapshot.start.time,
				p1: statistic.snapshot.start.p1,
				x: statistic.snapshot.start.x,
				p2: statistic.snapshot.start.p2,
				mod: statistic.snapshot.start.mod,
			},
			end: {
				time: statistic.snapshot.end.time,
				p1: statistic.snapshot.end.p1,
				x: statistic.snapshot.end.x,
				p2: statistic.snapshot.end.p2,
				mod: statistic.snapshot.end.mod,
			}
		},
		cards: {
			one: {
				red: statistic.cards.one.red,
				attacks: statistic.cards.one.attacks,
				danAttacks: statistic.cards.one.danAttacks,
			},
			two: {
				red: statistic.cards.one.red,
				attacks: statistic.cards.one.attacks,
				danAttacks: statistic.cards.one.danAttacks,
			}
		},
		createdBy: getFormattedDate(statistic.createdBy),
		modifiedBy: getFormattedDate(statistic.modifiedBy)
	};
}

module.exports = {
	mapProps
};