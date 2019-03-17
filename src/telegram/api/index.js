const config = require('config');
const {
	setFileApiTelegram,
	setTextApiTelegram,
	setSupportMsgApiTelegram
} = require('../../fetch');
require('../bot');

const token = process.env.NODE_ENV === 'development'
	? config.bots.dev.token
	: config.bots.test.token;
const chatId = process.env.NODE_ENV === 'development'
	? config.bots.dev.chatId
	: config.bots.test.chatId;
const channelId = process.env.NODE_ENV === 'development'
	? config.bots.dev.channelId
	: config.bots.test.channelId;

const supportChatId = process.env.NODE_ENV === 'development'
	? config.bots.supportDev.chatId
	: config.bots.supportTest.chatId;

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
			resolve(setSupportMsgApiTelegram(token, supportChatId, text));
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
			resolve(setFileApiTelegram(token, supportChatId, file));
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