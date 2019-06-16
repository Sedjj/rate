const config = require('config');
const {performEmulation} = require('../selenium/bot');
const {rateStatus} = require('../store/rateStatus');
/*
const {sendMessageChat} = require('../telegram/api');
const {decorateMessageTennis} = require('../utils/formateMessage');
*/

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
	const {snapshot, cards, matchId, score} = statistic;
	switch (statistic.strategy) {
		case 1 :
			if (snapshot.start.x > 3.16 && snapshot.start.time < 3060) {
				if ((-0.6 < (snapshot.end.p2 - snapshot.end.p1)) || ((snapshot.end.p2 - snapshot.end.p1) < -1)) {
					if (score.sc1 === 0 && score.sc2 === 1) {
						if ((cards.after.two.red !== 1) && (cards.before.one.attacks < 80)) {
							// await sendMessageChat(decorateMessageTennis(statistic));
							if (rateStatus.status) {
								await performEmulation(matchId, 9, `Total Over ${total}`);
							}
						}
					}
				}
			}
			break;
		case 4 :
			if (snapshot.start.p1 <= snapshot.start.p2) {
				if (snapshot.start.time < 2754 && snapshot.start.x > 3) {
					if ((cards.before.one.attacks > 0) && (cards.before.one.danAttacks !== 0)) {
						if (rateStatus.status) {
							await performEmulation(matchId, 10, `Total Under ${total}`);
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