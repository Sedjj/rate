const config = require('config');
const typeRate = config.choice.live.football.typeRate;

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
 * Метод для преобразования секунд в минуты.
 *
 * @param {Number} time время в секундах
 * @returns {void|string|never}
 */
function secondsToMinutes(time) {
	return Math.floor(time / 60);
}

/**
 * Форматирование строки вывода.
 *
 * @param {Object} param объект матча
 * @param {String} type вид спорта
 * @returns {*}
 */
function decorateMessageMatch(param, type) {
	return `Матч: ${param.matchId}; Стр: ${param.strategy}; Счет: ${param.score.sc1}:${param.score.sc2}
	Вид спорта: ${type}
	Группа: ${param.group.en}
	  Команда 1:  ${param.command.en.one}
	  Команда 2:  ${param.command.en.two}`;
}

/**
 * Форматирование строки для канала.
 *
 * @param {Object} param объект матча
 * @returns {string}
 */
function decorateMessageChannel(param) {
	const time = secondsToMinutes(param.snapshot.end.time);
	const scope = `${param.score.sc1}:${param.score.sc2}`;
	const typeTotal = param.score.sc1 + param.score.sc2 + typeRate[param.strategy];
	return `<b>${param.group.en}</b>\n\n${param.command.en.one}\n${param.command.en.two}\n\n<pre>${scope} / ${time}'\nTotal over ${typeTotal} / ${param.total}</pre>`;
}

module.exports = {
	decorateMessageMatch,
	decorateMessageChannel,
	replaceAll
};