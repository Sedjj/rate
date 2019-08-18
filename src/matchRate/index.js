const config = require('config');
const {bot: {performEmulation}} = require('../selenium/bot');
const {sendMessageChat} = require('../telegram/api');
const {decorateMessageTennis} = require('../utils/formateMessage');

const typeRate = config['choice'].live['football']['typeRate'];

/**
 * Метод для вывода в телеграмм матча и запуск процедуры "Ставка".
 *
 * @param {FootballModel} statistic объект матча
 * @param {String} type вид спорта
 * @returns {Promise<void>}
 */
async function matchRate(statistic, type = '') {
	const totalRate = statistic.score.sc1 + statistic.score.sc2 + typeRate[statistic.strategy];
	const {
		snapshot: {start: {time, x, p1, p2}},
		cards: {before: {one, two}},
		score: {sc1, sc2},
		matchId,
		total,
		command: {women, limited, youth}
	} = statistic;
	switch (statistic.strategy) {
		case 3 :
			if (3.6 <= x && (Math.abs(p2 - p1) <= 2.2)) {
				// await sendMessageChat(decorateMessageTennis(statistic, type));
				await performEmulation(matchId, 9, `Total Over ${totalRate}`);
			}
			break;
		case 7 :
			if (limited === 0 && women === 0 && youth === 0) {
				if (sc1 === 1 && sc2 === 0) {
					if ((p2 - p1) < 1 && two.danAttacks < 16) {
						await sendMessageChat(decorateMessageTennis(statistic, type));
					}
				}
				if (sc1 === 0 && sc2 === 1) {
					if (-1.2 < (p2 - p1) && (p2 - p1) < 2) {
						if (p1 <= 2.8 && time < 1620) {
							await sendMessageChat(decorateMessageTennis(statistic, type));
						}
					}
				}
			}
			break;
		/*case 3 :
			if (limited === 0 && women === 0 && youth === 0 && 210 < time) {
				if (sc1 === 1 && sc2 === 0) {
					if (4.4 <= x && ((p2 - p1) < 2)) {
						if (one.attacks < 10 && two.danAttacks < 16) {
							await sendMessageChat(decorateMessageTennis(statistic, type));
							await performEmulation(matchId, 9, `Total Over ${totalRate}`);
						}
					}
				}
				if (sc1 === 0 && sc2 === 1) {
					if (4.2 <= x && (Math.abs(p2 - p1) <= 1.9)) {
						if (one.danAttacks < 20) {
							await sendMessageChat(decorateMessageTennis(statistic, type));
							await performEmulation(matchId, 9, `Total Over ${totalRate}`);
						}
					}
				}
			}
			break;*/
		/*case 6 :
			if (attacks > 0) {
				if (total > 2) {
					await performEmulation(matchId, 10, `Total Under ${totalRate}`);
					await sendMessageChat(decorateMessageTennis(statistic, type));
				}
			}
			break;*/
		default:
			break;
	}
}

module.exports = {
	matchRate
};