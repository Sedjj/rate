const config = require('config');
const {
	setFileApiTelegram,
	setTextApiTelegram,
	setSupportMsgApiTelegram,
	setPhotoApiTelegram,
} = require('../../fetch');

const token = process.env.NODE_ENV === 'development'
	? config['bots'].dev.token
	: config['bots'].prod.token;
const chatId = process.env.NODE_ENV === 'development'
	? config['bots'].dev.chatId
	: config['bots'].prod.chatId;
const channelId = process.env.NODE_ENV === 'development'
	? config['bots'].dev['channelId']
	: config['bots'].prod['channelId'];

const supportChatId = process.env.NODE_ENV === 'development'
	? config['bots'].supportDev.chatId
	: config['bots'].supportProd.chatId;

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

/**
 * Метод отправки фотки в телеграмм бот.
 *
 * @param {ReadStream} file для отправки в чат
 * @param {String} title Заголовок для фотки
 */
function sendPhoto(file, title) {
	return new Promise((resolve, reject) => {
		try {
			resolve(setPhotoApiTelegram(token, supportChatId, file, title));
		} catch (error) {
			reject(error);
		}
	});
}

module.exports = {
	sendMessageChat,
	sendMessageChannel,
	sendMessageSupport,
	sendFile,
	sendPhoto,
};