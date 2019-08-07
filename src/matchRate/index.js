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
		snapshot: {start},
		cards: {before: {two, one}},
		matchId,
		score: {sc1, sc2},
		command: {women, youth, limited},
		total
	} = statistic;
	switch (statistic.strategy) {
		/*case 1 :
			if (women === 0) {
				if (sc1 === 0 && sc2 === 1 && youth === 0) {
					if ((two.red === 0) && (start.p1 > 2.65)) {
						if ((one.shotsOff < 8) && (one.shotsOn < 5)) {
							if (Math.abs(start.x - start.p1) > 0.5) {
								if ((two.attack > 37) && (two.danAttacks > 20)) {
									await sendMessageChat(decorateMessageTennis(statistic));
									await performEmulation(matchId, 3, `${en.two}`);
								}
							}
						}
					}
				}
				if (sc1 === 1 && sc2 === 0 && youth === 1) {
					if ((start.x - start.p2) <= 0.1) {
						await sendMessageChat(decorateMessageTennis(statistic));
						await performEmulation(matchId, 1, `${en.one}`);
					}
				} else if (sc1 === 1 && sc2 === 0 && youth === 0) {
					if (two.red === 0) {
						if ((start.x - start.p2) >= 0.75) {
							if ((two.attack < 30) && (two.danAttacks < 50)) {
								await sendMessageChat(decorateMessageTennis(statistic));
								await performEmulation(matchId, 1, `${en.one}`);
							}
						}
					}
				}
			}
			break;*/
		case 3 :
			if (limited === 0) {
				if (sc1 === 1 && sc2 === 0 && women === 0) {
					if (210 <= start.time && start.time <= 1680) {
						if (4.4 <= start.x && start.x <= 5.1) {
							await performEmulation(matchId, 9, `Total Over ${totalRate}`);
						}
					}
				}
				if (sc1 === 0 && sc2 === 1) {
					if (210 <= start.time && start.time <= 1500) {
						if (4.2 <= start.x && start.x <= 4.8) {
							await performEmulation(matchId, 9, `Total Over ${totalRate}`);
						}
					}
				}
			}
			break;
		case 4 :
			if (two.shotsOff < 5 && two.red === 0 && one.red === 0 && total > 1.82) {
				if (start.p1 < start.p2 && women === 0) {
					if (one.shotsOff < 6 && two.shotsOn < 4) {
						if ((35 < one.attack && one.attack < 66) && one.danAttacks < 40) {
							await performEmulation(matchId, 10, `Total Under ${totalRate}`);
						}
					}
				}
				if (start.p1 > start.p2 && women === 0 && youth === 0) {
					if (start.x > 3.19) {
						if (one.shotsOn < 2 && two.shotsOn < 3) {
							await performEmulation(matchId, 10, `Total Under ${totalRate}`);
						}
					}
				}
			}
			break;
		case 7 :
			if (limited === 0) {
				if (sc1 === 1 && sc2 === 0 && women === 0) {
					if (210 <= start.time && start.time <= 1680) {
						if (4.4 <= start.x && start.x <= 5.1) {
							await sendMessageChat(decorateMessageTennis(statistic));
						}
					}
				}
				if (sc1 === 0 && sc2 === 1) {
					if (210 <= start.time && start.time <= 1500) {
						if (4.2 <= start.x && start.x <= 4.8) {
							await sendMessageChat(decorateMessageTennis(statistic));
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