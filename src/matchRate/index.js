const config = require('config');
const {bot: {performEmulation}} = require('../selenium/bot');
const {sendMessageChannel, sendMessageChat} = require('../telegram/api');
const {decorateMessageChannel} = require('../utils/formateMessage');

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
		command: {women, limited, youth},
		total
	} = statistic;
	switch (statistic.strategy) {
		/*case 3 :
			if (limited === 0 && women === 0 && youth === 0) {
				if (sc1 === 1 && sc2 === 0) {
					if (0.15 < (x - p1) && 0.99 < (x - p2) && (p2 - p1) < 0.25) {
						await performEmulation(matchId, 9, `Total Over ${totalRate}`);
					}
				}
				if (sc1 === 0 && sc2 === 1) {
					if (1.14 < (x - p1) && 1.4 < (x - p2) && two.attacks < 10) {
						await performEmulation(matchId, 9, `Total Over ${totalRate}`);
					}
				}
			}
			break;*/
		/*case 4 :
			if (youth === 0 && total >= 1.8 && 2.7 <= x && x <= 4.4) {
				if (20 < two.danAttacks && 20 < one.danAttacks) {
					if (-3.6 < (x - p1) && two.shotsOn < 3 && two.shotsOff < 5 && one.shotsOff < 5) {
						await sendMessageChat(decorateMessageChannel(statistic, type));
						await performEmulation(matchId, 10, `Total Under ${totalRate}`);
					}
				}
			}
			break;*/
		case 4 :
			if (2.94 < x) {
				await sendMessageChat(decorateMessageChannel(statistic, type));
				await performEmulation(matchId, 10, `Total Under ${totalRate}`);
			}
			break;
		case 7 :
			if (limited === 0) {
				// ТБ2
				if (sc1 === 1 && sc2 === 0) {
					if ((1.85 <= (x - p1)) && (0.4 < (x - p2)) && (((p2 - p1) < 0.9) || (1.36 < (p2 - p1)))) {
						if (4.05 < x && two.shotsOn < 2 && one.shotsOn < 2 && one.danAttacks < 11) {
							if (one.attacks < 15 && two.attacks < 15 && 0 < two.danAttacks) {
								await sendMessageChannel(decorateMessageChannel(statistic, type));
								await sendMessageChannel('ТБ2(ТБ1,5) в 1-м тайме');
							}
						}
					}
				}
				if (sc1 === 0 && sc2 === 1 && women === 0 && 0 < one.danAttacks) {
					if ((1 < (x - p1)) && ((x - p2) < 3.38) && (((p2 - p1) < -0.43) || (0.12 < (p2 - p1)))) {
						if (0 < one.attacks && one.attacks < 10 && two.attacks < 9) {
							await sendMessageChannel(decorateMessageChannel(statistic, type));
							await sendMessageChannel('ТБ2(ТБ1,5) в 1-м тайме');
						}
					}
				}
				// ТМ2
				if (sc1 === 1 && sc2 === 0) {
					if ((x - p2) < 0.4 && 600 < time && time < 1500) {
						if (x < 4.05 && one.attacks < 24 && 4 < one.danAttacks) {
							await sendMessageChannel(decorateMessageChannel(statistic, type));
							await sendMessageChannel('ТМ2(ТМ2,5) в 1-м тайме');
						}
					}
				}
				if (sc1 === 0 && sc2 === 1) {
					if (time < 2100 && x < 3.7 && two.shotsOn < 3) {
						if ((x - p1) < 1.1 && 0.9 < (x - p2)) {
							if (9 < one.danAttacks && 4 < two.danAttacks) {
								await sendMessageChannel(decorateMessageChannel(statistic, type));
								await sendMessageChannel('ТМ2(ТМ2,5) в 1-м тайме');
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