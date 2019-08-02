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
	const total = statistic.score.sc1 + statistic.score.sc2 + typeRate[statistic.strategy];
	const {
		snapshot: {start},
		cards: {before: {two, one}},
		matchId,
		score: {sc1, sc2},
		command: {women, youth}
	} = statistic;
	switch (statistic.strategy) {
		case 1 :
			if (women === 0) {
				if (sc1 === 0 && sc2 === 1 && youth === 0) {
					if ((two.red === 0) && (start.p1 > 2.65)) {
						if ((one.shotsOff < 8) && (one.shotsOn < 5)) {
							if (Math.abs(start.x - start.p1) > 0.5) {
								if ((two.attack > 37) && (two.danAttacks > 20)) {
									await sendMessageChat(decorateMessageTennis(statistic));
									await performEmulation(matchId, 9, `Total Over ${total}`);
								}
							}
						}
					}
				}
				if (sc1 === 1 && sc2 === 0 && youth === 1) {
					if ((start.x - start.p2) <= 0.1) {
						await sendMessageChat(decorateMessageTennis(statistic));
						await performEmulation(matchId, 9, `Total Over ${total}`);
					}
				} else if (sc1 === 1 && sc2 === 0 && youth === 0) {
					if (two.red === 0) {
						if ((start.x - start.p2) >= 0.75) {
							if ((two.attack < 30) && (two.danAttacks < 50)) {
								await sendMessageChat(decorateMessageTennis(statistic));
								await performEmulation(matchId, 9, `Total Over ${total}`);
							}
						}
					}
				}
			}
			break;
		case 3 :
			if (sc1 === 0 && sc2 === 1 && women === 0) {
				if ((start.x - start.p2) > 1) {
					if ((start.p2 - start.p1) >= -1.3) {
						/*await sendMessageChat(decorateMessageTennis(statistic));*/
						await performEmulation(matchId, 9, `Total Over ${total}`);
					}
				}
			}
			if (sc1 === 1 && sc2 === 0) {
				if ((start.x - start.p1) >= 1.6) {
					if ((start.x - start.p2) > 0) {
						/*await sendMessageChat(decorateMessageTennis(statistic));*/
						await performEmulation(matchId, 9, `Total Over ${total}`);
					}
				}
			}
			break;
		case 6 :
			await performEmulation(matchId, 9, `Total Over ${total}`);
			if (sc1 === 0 && sc2 === 1 && women === 0) {
				if ((start.x - start.p2) > 1) {
					if ((start.p2 - start.p1) >= -1.3) {
						await sendMessageChat(decorateMessageTennis(statistic));
					}
				}
			}
			if (sc1 === 1 && sc2 === 0) {
				if ((start.x - start.p1) >= 1.6) {
					if ((start.x - start.p2) > 0) {
						await sendMessageChat(decorateMessageTennis(statistic));
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