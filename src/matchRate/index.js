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
		snapshot: {start: {time, x}},
		cards: {before: {one: {attacks}}},
		score: {sc1, sc2},
		matchId,
		total,
		command: {women, limited}
	} = statistic;
	switch (statistic.strategy) {
		case 3 :
			if (limited === 0) {
				if (sc1 === 1 && sc2 === 0 && women === 0) {
					if (210 <= time && time <= 1680) {
						if (4.4 <= x && x <= 5.1) {
							await sendMessageChat(decorateMessageTennis(statistic, type));
							await performEmulation(matchId, 10, `Total Under ${totalRate}`);
						}
					}
				}
				if (sc1 === 0 && sc2 === 1) {
					if (210 <= time && time <= 1500) {
						if (4.2 <= x && x <= 4.8) {
							await sendMessageChat(decorateMessageTennis(statistic, type));
							await performEmulation(matchId, 10, `Total Under ${totalRate}`);
						}
					}
				}
			}
			break;
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