const dateFormat = {
	day: 'numeric',
	month: 'numeric',
	timezone: 'UTC',
	year: 'numeric'
};

const timeFormat = {
	hour: 'numeric',
	minute: 'numeric'
};

const dateTimeFormat = {
	hour: 'numeric',
	minute: 'numeric',
	day: 'numeric',
	month: 'numeric',
	timezone: 'UTC',
	year: 'numeric'
};

/**
 * Пребразование даты в строку вида yyyy-mm-dd hh:mm
 *
 * @param {Date} date - дата
 * @returns {String} дата в формате строки
 */
function getFormattedDateTime(date) {
	return new Intl.DateTimeFormat('ru-RU', dateTimeFormat).format(date);
}

/**
 * Пребразование даты в строку вида yyyy-mm-dd
 *
 * @param {Date} date - дата
 * @returns {String} дата в формате строки
 */
function getFormattedDate(date) {
	return new Intl.DateTimeFormat('ru-RU', dateFormat).format(date);
}

/**
 * Пребразование даты в строку времени вида hh:mm
 *
 * @param {Date} date - дата.
 * @returns {String} дата в формате строки
 */
function getFormattedTime(date) {
	return new Intl.DateTimeFormat('ru-RU', timeFormat).format(date);
}

/**
 * Пребразование даты в число для сравнения
 *
 * @param {Date} date - дата
 * @returns {String} дата в формате строки
 */
function getTime(date) {
	return new Date(getFormattedDate(date)).getTime();
}

/**
 * Преобразует строку даты в формата вида yyyy-mm-dd hh:mm
 *
 * @param {Date} date - дата
 * @returns {String} дата в формате строки
 */
function getDateTime(date) {
	return getFormattedDateTime(new Date(date));
}

module.exports = {
	getFormattedDateTime,
	getFormattedDate,
	getFormattedTime,
	getDateTime,
	getTime
};