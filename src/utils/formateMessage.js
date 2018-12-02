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
function decorateMessageMatch(item) {
	return `Матч: ${item.matchId}; Стр: ${item.strategy}; Счет: ${item.score}
	Группа: ${item.group.ru}
	  Команда 1:  ${item.command.ru.one}
	  Команда 2:  ${item.command.ru.two}`;
}

/**
 * Форматирование строки вывода.
 *
 * @param {String} item объект матча
 * @returns {*}
 */
function decorateMessageEveryReport(item) {
	return `Ежедневный отчет:
	   _all:   ${item.allMatch}
	  str1:   ${item.strategyOne}
	   0:0:   ${item.strategyTwo_zero}
	   1:1:   ${item.strategyTwo_one}
	   2:2:   ${item.strategyTwo_two}
	  Без ()
	   _all:   ${item.allMatch_withoutLeagues}
	  str1:   ${item.strategyOne_withoutLeagues}
	   0:0:   ${item.strategyTwo_zero_withoutLeagues}
	   1:1:   ${item.strategyTwo_one_withoutLeagues}
	   2:2:   ${item.strategyTwo_two_withoutLeagues}`;
}

module.exports = {
	escapeRegExp,
	decorateMessageMatch,
	decorateMessageEveryReport,
	replaceAll
};