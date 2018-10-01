const dateFormatUser = {
	day: 'numeric',
	month: 'numeric',
	timezone: 'UTC'
};

const dateFormatArchive = {
	day: 'numeric',
	month: 'numeric',
	timezone: 'UTC',
	year: 'numeric'
};

const timeFormat = {
	hour: 'numeric',
	minute: 'numeric'
};

/**
 * Пребразование даты в строку вида dd.mm
 *
 * @param {Date} date - дата.
 * @returns {String} дата в формате строки
 */
export function getFormattedDate(date: Date) {
	return new Intl.DateTimeFormat('ru-RU', dateFormatUser).format(date);
}

/**
 * Пребразование даты в строку вида dd.mm.yyyy
 *
 * @param {Date} date - дата.
 * @returns {String} дата в формате строки
 */
export function getFormattedMaxDate(date: Date) {
	return new Intl.DateTimeFormat('ru-RU', dateFormatArchive).format(date);
}

/**
 * Пребразование даты в строку времени вида hh:mm
 *
 * @param {Date} date - дата.
 * @returns {String} дата в формате строки
 */
export function getFormattedTime(date: Date) {
	return new Intl.DateTimeFormat('ru-RU', timeFormat).format(date);
}

/**
 * Пребразование даты в число для сравнения
 *
 * @param {Date} date - дата.
 * @returns {String} дата в формате строки
 */
export function getTime(date: Date) {
	return new Date(getFormattedDate(date)).getTime();
}