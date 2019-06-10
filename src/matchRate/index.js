const config = require('config');
const {performEmulation} = require('../selenium/bot');
const {sendMessageChat, sendMessageChannel} = require('../telegram/api');
const {decorateMessageTennis, decorateMessageMatch, decorateMessageChannel} = require('../utils/formateMessage');

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
	switch (statistic.strategy) {
		case 1 :
			await sendMessageChat(decorateMessageTennis(statistic));
			performEmulation(statistic.matchId, `Total Over ${total}`);
			break;
		case 4 :
			performEmulation(statistic.matchId, `Total Over ${total}`);
			break;
		case 5 :
			performEmulation(statistic.matchId, `Total Over ${total}`);
			break;
		default:
			break;
	}

	/*if ((statistic.command.women !== 1) && (statistic.command.youth !== 1)) {
		switch (statistic.strategy) {
			case 1 :
				if ((statistic.snapshot.end.x < 3) && (statistic.snapshot.end.mod > 2.5)) {
					//await sendMessageChat(decorateMessageMatch(statistic));
					await sendMessageChannel(decorateMessageChannel(statistic));
					await sendMessageChannel('<pre>Result</pre>');
				}
				break;
			case 2 :
				if ((3000 < statistic.snapshot.end.time) && (statistic.snapshot.end.time < 3570)) {
					// A
					if (statistic.snapshot.start.p1 < statistic.snapshot.start.p2) {
						if ((statistic.cards.after.one.danAttacks < 46) && (statistic.snapshot.start.x > 2.5)) {
							if ((statistic.cards.after.one.attacks > 39) && (statistic.cards.before.one.shotsOn !== 1)) {
								//await sendMessageChat(decorateMessageMatch(statistic));
								await sendMessageChannel(decorateMessageChannel(statistic));
								await sendMessageChannel('<pre>Result</pre>');
							}
						}
					} else { //B
						if ((50 < statistic.cards.after.two.attacks) && (statistic.cards.after.two.attacks < 80)) {
							//await sendMessageChat(decorateMessageMatch(statistic));
							await sendMessageChannel(decorateMessageChannel(statistic));
							await sendMessageChannel('<pre>Result</pre>');
						}
					}
				}
				break;
			case 3 :
				if ((statistic.snapshot.end.time < 3720)) {
					// A
					if (statistic.snapshot.start.p1 < statistic.snapshot.start.p2) {
						if (statistic.snapshot.end.x < 2.4) {
							if ((statistic.cards.after.one.danAttacks > 50) && (statistic.cards.before.one.attacks > 52)) {
								//await sendMessageChat(decorateMessageMatch(statistic));
								await sendMessageChannel(decorateMessageChannel(statistic));
								await sendMessageChannel('<pre>Result</pre>');
							}
						}
					} else { //B
						if (statistic.snapshot.start.x < 2.4) {
							//await sendMessageChat(decorateMessageMatch(statistic));
							await sendMessageChannel(decorateMessageChannel(statistic));
							await sendMessageChannel('<pre>Result</pre>');
						}
					}
				}
				break;
		}
	}*/
}

module.exports = {
	matchRate
};