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
			// A
			if (statistic.snapshot.start.p1 < statistic.snapshot.start.p2) {
				if (statistic.command.women !== 1) {
					if ((55 < statistic.cards.after.one.attacks && statistic.cards.after.one.attacks < 93) && (statistic.snapshot.end.mod > 4.59)) {
						if (statistic.cards.before.one.shotsOn < 3 && statistic.snapshot.start.time < 2748) {
							//await sendMessageChat(decorateMessageMatch(statistic));
							await sendMessageChannel(decorateMessageChannel(statistic));
							await sendMessageChannel('<pre>Result</pre>');
						}
					}
				}
			} else { //B
				if ((statistic.command.women !== 1) && (statistic.command.youth !== 1)) {
					if ((statistic.snapshot.start.p1 > 6.99) && (statistic.cards.before.two.shotsOn > 2)) {
						//await sendMessageChat(decorateMessageMatch(statistic));
						await sendMessageChannel(decorateMessageChannel(statistic));
						await sendMessageChannel('<pre>Result</pre>');
					}
				}
			}
			break;
		case 3 :
			if ((statistic.command.women !== 1) && (statistic.command.youth !== 1)) {
				// A
				if (statistic.snapshot.start.p1 < statistic.snapshot.start.p2) {
					if ((statistic.cards.before.one.shotsOff > 5) && (statistic.snapshot.end.time < 3720)) {
						//await sendMessageChat(decorateMessageMatch(statistic));
						await sendMessageChannel(decorateMessageChannel(statistic));
						await sendMessageChannel('<pre>Result</pre>');
					}
				} else { //B
					if (statistic.cards.before.two.shotsOn > 1) {
						if ((3000 < statistic.snapshot.start.time) && (statistic.snapshot.end.time < 3780)) {
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