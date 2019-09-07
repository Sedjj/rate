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
		group:{en},
		cards: {before: {one, two}},
		score: {sc1, sc2},
		matchId,
		command: {women, limited, youth}
	} = statistic;
	switch (statistic.strategy) {
		case 3 :
			if (limited === 0 && women === 0 && youth === 0) {
				if(3.85 < x && time < 1200){
					if (sc1 === 1 && sc2 === 0) {
						if (0.6 < (x - p1) && 1.45 < (x - p2)) {
							if(en.toString().trim() !== 'Club Friendlies'.trim()){
								await sendMessageChat(decorateMessageChannel(statistic, type));
								await performEmulation(matchId, 9, `Total Over ${totalRate}`);
							}
						}
					}
					if (sc1 === 0 && sc2 === 1) {
						if (two.attacks < 10 && two.danAttacks < 5 && 252 < time) {
							await sendMessageChat(decorateMessageChannel(statistic, type));
							await performEmulation(matchId, 9, `Total Over ${totalRate}`);
						}
					}
				}
			}
			break;
		case 7 :
			if (limited === 0 && women === 0 && youth === 0) {
				if (sc1 === 1 && sc2 === 0) {
					if (0.15 <= (x - p1) && (p2 - p1) < 0.25) {
						await sendMessageChannel(decorateMessageChannel(statistic, type));
						await sendMessageChannel('Result');
					}
				}
				if (sc1 === 0 && sc2 === 1) {
					if (one.attacks < 21 && time < 1200) {
						if (0.8 < (x - p1) && 1.1 < (x - p2)) {
							await sendMessageChannel(decorateMessageChannel(statistic, type));
							await sendMessageChannel('Result');
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