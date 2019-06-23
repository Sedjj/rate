const config = require('config');
const {performEmulation} = require('../selenium/bot');
const {sendMessageChat} = require('../telegram/api');
const {decorateMessageTennis} = require('../utils/formateMessage');

const typeRate = config.choice.live.football.typeRate;

/**
 * Метод для вывода в телеграмм матча и запуск процедуры "Ставка".
 *
 * @param {Object} statistic объект матча
 * @param {String} type вид спорта
 * @returns {Promise<void>}
 */
async function matchRate(statistic, type = '') {
	const total = statistic.score.sc1 + statistic.score.sc2 + typeRate[statistic.strategy];
	const {snapshot, cards, matchId, score, command} = statistic;
	switch (statistic.strategy) {
		case 1 :
			if (score.sc1 === 0 && score.sc2 === 1 && snapshot.end.time < 3060) {
				if ((cards.after.two.red === 0) && (30 <= cards.before.one.danAttacks)) {
					if (0.8 <= (snapshot.end.x - snapshot.end.p2)) {
						await sendMessageChat(decorateMessageTennis(statistic));
						await performEmulation(matchId, 9, `Total Over ${total}`);
					}
				}
			}
			break;
		case 2 :
			if (command.women === 0 && command.youth === 0) {
				if (snapshot.end.p1 <= snapshot.end.p2) {
					if (1.7 <= snapshot.start.p1 && 5 > snapshot.start.mod) {
						if (0 > (snapshot.start.x - snapshot.start.p2)) {
							if (0.3 < snapshot.end.mod && 0.25 < (snapshot.end.x - snapshot.end.p1)) {
								await performEmulation(matchId, 9, `Total Over ${total}`);
							}
						}
					}
				}
				if (snapshot.end.p1 > snapshot.end.p2) {
					if (2.95 < snapshot.start.x && 1.8 < snapshot.start.p2) {
						if (2.75 <= snapshot.end.x) {
							if (-0.5 >= (snapshot.end.x - snapshot.end.p1)) {
								await performEmulation(matchId, 9, `Total Over ${total}`);
							}
						}
					}
				}
			}
			break;
		case 4 :
			if (command.women === 0) {
				if (snapshot.end.p1 <= snapshot.end.p2) {
					if (1.8 > snapshot.start.mod && 3 < snapshot.start.x) {
						if ((cards.before.two.danAttacks > 0) && (cards.before.one.attacks < 51)) {
							await performEmulation(matchId, 10, `Total Under ${total}`);
						}
					}
				}
			}
			if (command.youth === 0) {
				if (snapshot.end.p1 > snapshot.end.p2) {
					if (1.6 > (snapshot.start.x - snapshot.start.p2)) {
						if (3.2 <= snapshot.start.x) {
							if ((cards.before.one.attacks > 45) && (cards.before.two.attacks > 45)) {
								await performEmulation(matchId, 10, `Total Under ${total}`);
							}
						}
					}
				}
			}
			break;
		default:
			break;
	}
}

module.exports = {
	matchRate
};