const config = require('config');
const {setFileApiTelegram, setTextApiTelegram} = require('../fetch');

const token = process.env.NODE_ENV === 'development'
	? config.get('bots.dev.token')
	: config.get('bots.prod.token');
const chatId = process.env.NODE_ENV === 'development'
	? config.get('bots.dev.chatId')
	: config.get('bots.prod.chatId');
const channelId = process.env.NODE_ENV === 'development'
	? config.get('bots.dev.channelId')
	: config.get('bots.prod.channelId');

const supportToken = process.env.NODE_ENV === 'development'
	? config.get('bots.supportDev.token')
	: config.get('bots.supportProd.token');
const supportChatId = process.env.NODE_ENV === 'development'
	? config.get('bots.supportDev.chatId')
	: config.get('bots.supportProd.chatId');

/**
 * Метод отправки сообщений в телеграмм бот.
 *
 * @param {String} text строка для отправки в чат
 */
function sendMessageChat(text) {
	return new Promise((resolve, reject) => {
		try {
			resolve(setTextApiTelegram(token, chatId, text));
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Метод отправки сообщений в телеграмм бот.
 *
 * @param {String} text строка для отправки в чат
 */
function sendMessageChannel(text) {
	return new Promise((resolve, reject) => {
		try {
			resolve(setTextApiTelegram(token, channelId, text));
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Метод отправки технических сообщений в телеграмм бот.
 *
 * @param {String} text строка для отправки в чат
 */
function sendMessageSupport(text) {
	return new Promise((resolve, reject) => {
		try {
			resolve(setTextApiTelegram(supportToken, supportChatId, text));
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Метод отправки файла в телеграмм бот.
 *
 * @param {String} file для отправки в чат
 */
function sendFile(file) {
	return new Promise((resolve, reject) => {
		try {
			resolve(setFileApiTelegram(supportToken, supportChatId, file));
		} catch (error) {
			reject(error);
		}
	});
}

module.exports = {
	sendMessageChat,
	sendMessageChannel,
	sendMessageSupport,
	sendFile
};