const {sendMessage} = require('../telegramApi');
const {decorateMessageMatch} = require('../utils/formateMessage');

/**
 * Метод для вывода в телеграмм матча и запуск процедуры "Ставка".
 *
 * @param {Object} statistic объект матча
 * @returns {Promise<void>}
 */
async function matchRate(statistic) {
	if (statistic.strategy === 2 && statistic.snapshot.end.time < 3780 && statistic.snapshot.end.mod >= 5.5) {
		if ((statistic.command.women !== 1) && (statistic.command.youth !== 1)) {
			await sendMessage(decorateMessageMatch(statistic));
			await sendMessage(statistic.command.en.one);
		}
	}
}

module.exports = {
	matchRate
};