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
 * @param {Object} param объект матча
 * @returns {*}
 */
function decorateMessageMatch(param) {
	return `Матч: ${param.matchId}; Стр: ${param.strategy}; Счет: ${param.score.sc1}:${param.score.sc2}
	Группа: ${param.group.en}
	  Команда 1:  ${param.command.en.one}
	  Команда 2:  ${param.command.en.two}`;
}

module.exports = {
	decorateMessageMatch,
	replaceAll
};