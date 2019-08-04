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
			sc1: statistic.score.sc1,
			sc2: statistic.score.sc2,
			resulting: statistic.score.resulting,
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
			youth: statistic.command.youth,
			limited: statistic.command.limited
		},
		group: {
			ru: statistic.group.ru,
			en: statistic.group.en,
		},
		index: statistic.index,
		total: statistic.total,
		strategy: statistic.strategy,
		snapshot: {
			start: {
				time: statistic.snapshot.start.time,
				displayTime: statistic.snapshot.start.time / 60,
				p1: statistic.snapshot.start.p1,
				x: statistic.snapshot.start.x,
				p2: statistic.snapshot.start.p2,
				mod: statistic.snapshot.start.mod,
			},
			end: {
				time: statistic.snapshot.end.time,
				displayTime: statistic.snapshot.end.time / 60,
				p1: statistic.snapshot.end.p1,
				x: statistic.snapshot.end.x,
				p2: statistic.snapshot.end.p2,
				mod: statistic.snapshot.end.mod,
			}
		},
		cards: {
			before: {
				one: {
					red: statistic.cards.before.one.red,
					attacks: statistic.cards.before.one.attacks,
					danAttacks: statistic.cards.before.one.danAttacks,
					shotsOn: statistic.cards.before.one.shotsOn,
					shotsOff: statistic.cards.before.one.shotsOff
				},
				two: {
					red: statistic.cards.before.two.red,
					attacks: statistic.cards.before.two.attacks,
					danAttacks: statistic.cards.before.two.danAttacks,
					shotsOn: statistic.cards.before.two.shotsOn,
					shotsOff: statistic.cards.before.two.shotsOff
				}
			},
			after: {
				one: {
					red: statistic.cards.after.one.red,
					attacks: statistic.cards.after.one.attacks,
					danAttacks: statistic.cards.after.one.danAttacks,
					shotsOn: statistic.cards.after.one.shotsOn,
					shotsOff: statistic.cards.after.one.shotsOff
				},
				two: {
					red: statistic.cards.after.two.red,
					attacks: statistic.cards.after.two.attacks,
					danAttacks: statistic.cards.after.two.danAttacks,
					shotsOn: statistic.cards.after.two.shotsOn,
					shotsOff: statistic.cards.after.two.shotsOff
				}
			}
		},
		createdBy: getFormattedDate(statistic.createdBy),
		modifiedBy: getFormattedDate(statistic.modifiedBy)
	};
}

module.exports = {
	mapProps
};