const {sendMessageChat, sendMessageChannel} = require('../telegramApi');
const {decorateMessageMatch, decorateMessageChannel} = require('../utils/formateMessage');

/**
 * Метод для вывода в телеграмм матча и запуск процедуры "Ставка".
 *
 * @param {Object} statistic объект матча
 * @returns {Promise<void>}
 */
async function matchRate(statistic) {
	switch (statistic.strategy) {
		case 2 :
			if ((3060 < statistic.snapshot.end.time && statistic.snapshot.end.time < 3570) && (statistic.command.women !== 1)) {
				if (statistic.snapshot.start.p1 < statistic.snapshot.start.p2) {
					if (statistic.cards.after.one.attacks < 75) {
						await sendMessageChat(decorateMessageMatch(statistic));
						await sendMessageChannel(decorateMessageChannel(statistic));
					}
				} else {
					if (statistic.cards.after.two.attacks < 75) {
						await sendMessageChat(decorateMessageMatch(statistic));
						await sendMessageChannel(decorateMessageChannel(statistic));
					}
				}
			}
			break;
		case 3 :
			if ((statistic.command.women !== 1) && (statistic.command.youth !== 1)) {
				if (3000 < statistic.snapshot.start.time && statistic.snapshot.end.time < 3720) {
					if (statistic.snapshot.start.p1 < statistic.snapshot.start.p2) {
						if (statistic.cards.after.one.attacks < 99) {
							await sendMessageChat(decorateMessageMatch(statistic));
							await sendMessageChannel(decorateMessageChannel(statistic));
						}
					} else {
						if (statistic.cards.after.two.attacks < 99) {
							await sendMessageChat(decorateMessageMatch(statistic));
							await sendMessageChannel(decorateMessageChannel(statistic));
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