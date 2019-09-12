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
		case 4 :
			if (youth === 0 && total >= 1.8 && 2.7 <= x && x <= 4.4) {
				if (20 < two.danAttacks && 20 < one.danAttacks) {
					if (-3.6 < (x - p1) && two.shotsOn < 3 && two.shotsOff < 5 && one.shotsOff < 5) {
						await sendMessageChat(decorateMessageChannel(statistic, type));
						await performEmulation(matchId, 10, `Total Under ${totalRate}`);
					}
				}
			}
			break;
		case 7 :
			if (limited === 0 && women === 0 && youth === 0) {
				// copy 3 strategy
				if (sc1 === 1 && sc2 === 0) {
					if (0.15 < (x - p1) && 0.99 < (x - p2) && (p2 - p1) < 0.25) {
						await sendMessageChannel(decorateMessageChannel(statistic, type));
						await sendMessageChannel('Result');
					}
				}
				if (sc1 === 0 && sc2 === 1) {
					if (1.14 < (x - p1) && 1.4 < (x - p2) && two.attacks < 10) {
						await sendMessageChannel(decorateMessageChannel(statistic, type));
						await sendMessageChannel('Result');
					}
				}
				// strategy 7
			/*	if (sc1 === 1 && sc2 === 0) {
					if ((time < 1800) && (4 < x)) {
						if (-1.4 <= (p2 - p1) && (p2 - p1) <= 0.8) {
							if (1.85 < (x - p2)) {
								await sendMessageChat(decorateMessageChannel(statistic, type));
							}
						}
					}
				}
				if (sc1 === 0 && sc2 === 1) {
					if ((time < 540) && (3.8 < x)) {
						if (-1.25 < (p2 - p1) && 1 < (x - p1)) {
							if (0 < one.danAttacks && two.attacks < 10) {
								await sendMessageChat(decorateMessageChannel(statistic, type));
							}
						}
					}
				}*/
			}
			break;
		default:
			break;
	}
}

module.exports = {
	matchRate
};