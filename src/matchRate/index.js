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
	// console.log(type);
	const total = statistic.score.sc1 + statistic.score.sc2 + typeRate[statistic.strategy];
	const {snapshot, cards, matchId, score} = statistic;
	switch (statistic.strategy) {
		case 1 :
			if (snapshot.start.x >= 3.16 && (snapshot.start.x - snapshot.start.p1) > 0.18) {
				if (score.sc1 ===0 &&  score.sc2 ===1) {
					// await sendMessageChat(decorateMessageTennis(statistic));
					await performEmulation(matchId, 9, `Total Over ${total}`);
				}
			}
			break;
		case 4 :
			if (snapshot.start.p1 <= snapshot.start.p2) {
				if (snapshot.start.time < 45.9 && snapshot.start.x > 3) {
					if ((cards.before.one.attacks > 0) && (cards.before.one.danAttacks !== 0)) {

						await performEmulation(matchId, 10, `Total Under ${total}`);
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