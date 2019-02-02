const {sendMessage} = require('../telegramApi');
const {decorateMessageMatch} = require('../utils/formateMessage');

/**
 * Метод для вывода в телеграмм матча и запуск процедуры "Ставка".
 *
 * @param {Object} statistic объект матча
 * @returns {Promise<void>}
 */
async function matchRate(statistic) {
	if ((statistic.command.women !== 1) && (statistic.command.youth !== 1)) {
		switch (statistic.strategy) {
			/*case 1 :
				if (2.9 <= statistic.snapshot.end.x && statistic.snapshot.end.x <= 3) {
					await sendMessage(decorateMessageMatch(statistic));
					await sendMessage(statistic.command.en.one);
				}
				break;*/
			case 2 :
				if ((3000 <= statistic.snapshot.end.time && statistic.snapshot.end.time <= 3570) && statistic.snapshot.start.x >= 2.8) {
					await sendMessage(decorateMessageMatch(statistic));
					await sendMessage(statistic.command.en.one);
				}
				break;
			case 3 :
				if (3000 <= statistic.snapshot.start.time && statistic.snapshot.end.time <= 3780) {
					await sendMessage(decorateMessageMatch(statistic));
					await sendMessage(statistic.command.en.one);
				}
				break;
		}
	}
}

module.exports = {
	matchRate
};