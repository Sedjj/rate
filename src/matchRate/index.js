const {sendMessage} = require('../telegramApi');
const {decorateMessageMatch} = require('../utils/formateMessage');

/**
 * Метод для вывода в телеграмм матча и запуск процедуры "Ставка".
 *
 * @param {Object} statistic объект матча
 * @returns {Promise<void>}
 */
async function matchRate(statistic) {
	await sendMessage(decorateMessageMatch(statistic));
	await sendMessage(statistic.command.en.one);
}

module.exports = {
	matchRate
};