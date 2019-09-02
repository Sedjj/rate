const config = require('config');

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
	const {
		matchId,
		command: {en: {one, two}},
		group: {en},
		strategy,
		score: {sc1, sc2}
	} = param;
	return `Матч: ${matchId}; Стр: ${strategy}; Счет: ${sc1}:${sc2}
	Вид спорта: ${type}
	Группа: ${en}
	  Команда 1:  ${one}
	  Команда 2:  ${two}`;
}

/**
 * Форматирование строки вывода для тениса.
 *
 * @param {Object} param объект матча
 * @param {String} type вид спорта
 * @returns {*}
 */
function decorateMessageTennis(param, type = '') {
	const {
		command: {en: {one, two}},
		strategy,
		group: {en},
		snapshot: {start},
	} = param;
	const index = `${start.p1} / ${start.x} / ${start.p2}`;
	return `<b>${en}</b>\n\n${one}\n${two}\n\n<pre>стр ${strategy} / ${index}</pre>`;
}

/**
 * Форматирование строки для канала.
 *
 * @param {Object} param объект матча
 * @param {String} type вид спорта
 * @returns {string}
 */
function decorateMessageChannel(param, type = '') {
	const {
		matchId,
		command: {en: {one, two}},
		group: {en},
		snapshot: {start: {p1, x, p2}, end},
		score: {sc1, sc2}
	} = param;
	const time = secondsToMinutes(end.time);
	const scope = `${sc1}:${sc2}`;
	const index = `${p1} / ${x} / ${p2}`;
	const difference = `${x - p1} / ${x - p2} / ${p2 - p1}`;
	return `${matchId}\n<b>${en}</b>\n\n${one}\n${two}\n\n<pre>${scope} / ${time}'\n${index}\n${difference}</pre>`;
}

module.exports = {
	decorateMessageMatch,
	decorateMessageTennis,
	decorateMessageChannel,
	replaceAll
};