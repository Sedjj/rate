/**
 * Сбрасывает все зарезервированные символы для регулярных выражений.
 *
 * @param str
 * @returns {void | string | *}
 */
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
 * @param {String} item объект матча
 * @returns {*}
 */
function decorateMessage(item) {
	return `Матч: ${item.matchId}; Стр: ${item.strategy}; Счет: ${item.score}
	  Команда 1:  ${item.commandOne}
	  Команда 2:  ${item.commandTwo}`;
}

module.exports = {
	escapeRegExp,
	decorateMessage,
	replaceAll
};