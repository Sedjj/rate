const log = require('../utils/logger')(module);

function escapeRegExp(str) {
	return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

/**
 * Кастомная функция для замены всех совпадений в строке.
 *
 * @param {String} str исходная строка
 * @param {String} find шаблон поиска
 * @param {String}replace строка замены
 * @returns {*}
 */
function replaceAll(str, find, replace) {
	return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

/**
 * Форматирование строки вывода.
 *
 * @param {String} seed сид пользователя
 * @param {Array} balances массив валют где есть баланс
 * @returns {*}
 */
function decorateMessage(seed, balances) {
	let message = 'seed:\n -' + seed + '\n\n\n' + 'balances: \n';
	return balances.reduce((previousValue, item) => {
		let balance = -1;
		try {
			balance = parseInt(item.balance) / 100000000;
		} catch (e) {
			log.info('Error in parsing: ' + e.messages);
		}
		return previousValue += ' -name: ' + item.name + '\n' + ' -balance: ' + balance + '\n\n';
	}, message);
}

module.exports = {
	decorateMessage
};