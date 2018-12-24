const Telegram = require('telegraf/telegram');
const SocksAgent = require('socks5-https-client/lib/Agent');
const config = require('config');
const {setFileApiTelegram} = require('../fetch');

const token = process.env.NODE_ENV === 'development'
	? config.get('bots.dev.token')
	: config.get('bots.prod.token');
const chatId = process.env.NODE_ENV === 'development'
	? config.get('bots.dev.chatId')
	: config.get('bots.prod.chatId');

const supportToken = process.env.NODE_ENV === 'development'
	? config.get('bots.supportDev.token')
	: config.get('bots.supportProd.token');
const supportChatId = process.env.NODE_ENV === 'development'
	? config.get('bots.supportDev.chatId')
	: config.get('bots.supportProd.chatId');

const socket = config.get('socket');
const socksAgent = new SocksAgent({
	socksHost: socket.host,
	socksPort: socket.port,
	socksUsername: socket.login,
	socksPassword: socket.password
});

const bot = new Telegram(token, {
	agent: socksAgent,
	webhookReply: true,
	webHook: {
		port: '3000'
	}
});

const supportBot = new Telegram(supportToken, {
	agent: socksAgent,
	webhookReply: true,
	webHook: {
		port: '3000'
	}
});

/**
 * Метод отправки сообщений в телеграмм бот.
 *
 * @param {String} text строка для отправки в чат
 */
function sendMessage(text) {
	return new Promise((resolve, reject) => {
		try {
			resolve(bot.sendMessage(chatId, text));
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
			resolve(supportBot.sendMessage(supportChatId, text));
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
	sendMessage,
	sendMessageSupport,
	sendFile
};