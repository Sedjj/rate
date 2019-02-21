const {sendMessageChat, sendMessageChannel} = require('../telegramApi');
const {decorateMessageMatch, decorateMessageChannel} = require('../utils/formateMessage');

/**
 * Метод для вывода в телеграмм матча и запуск процедуры "Ставка".
 *
 * @param {Object} statistic объект матча
 * @returns {Promise<void>}
 */
async function matchRate(statistic) {
	await sendMessageChat(decorateMessageMatch(statistic));
	switch (statistic.strategy) {
		case 2 :
			if (statistic.command.women !== 1) {
				if ((3060 < statistic.snapshot.end.time && statistic.snapshot.end.time < 3420) && (statistic.snapshot.start.mod < 5.6)) {
					if (statistic.snapshot.start.p1 < statistic.snapshot.start.p2) {
						if (statistic.cards.after.one.attacks < 81) {
							//await sendMessageChat(decorateMessageMatch(statistic));
							await sendMessageChannel(decorateMessageChannel(statistic));
							await sendMessageChannel('<pre>Result</pre>');
						}
					} else {
						if (statistic.cards.after.two.attacks < 81) {
							//await sendMessageChat(decorateMessageMatch(statistic));
							await sendMessageChannel(decorateMessageChannel(statistic));
							await sendMessageChannel('<pre>Result</pre>');
						}
					}
				}
			}
			break;
		case 3 :
			if ((statistic.command.women !== 1) && (statistic.command.youth !== 1)) {
				if (3000 < statistic.snapshot.start.time && statistic.snapshot.end.time < 3720) {
					if (statistic.snapshot.start.p1 < statistic.snapshot.start.p2) {
						if (statistic.cards.before.one.attacks < 99) {
							//await sendMessageChat(decorateMessageMatch(statistic));
							await sendMessageChannel(decorateMessageChannel(statistic));
							await sendMessageChannel('<pre>Result</pre>');
						}
					} else {
						if (statistic.cards.before.two.attacks < 99) {
							//await sendMessageChat(decorateMessageMatch(statistic));
							await sendMessageChannel(decorateMessageChannel(statistic));
							await sendMessageChannel('<pre>Result</pre>');
						}
					}
				}
			}
			break;
	}
}

module.exports = {
	matchRate
};