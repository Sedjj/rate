const Telegram = require('telegraf/telegram');
const SocksAgent = require('socks5-https-client/lib/Agent');
const log = require('../utils/logger');
const config = require('config');
const {setFileApiTelegram} = require('../fetch');

const token = process.env.NODE_ENV === 'development'
	? config.get('bots.dev.token')
	: config.get('bots.prod.token');
const socket = config.get('socket');
const chatId = process.env.NODE_ENV === 'development'
	? config.get('bots.dev.chatId')
	: config.get('bots.prod.chatId');
// const ngrok = 'https://0981648c.ngrok.io';

const socksAgent = new SocksAgent({
	socksHost: socket.host,
	socksPort: socket.port,
	socksUsername: socket.login,
	socksPassword: socket.psswd
});

const bot = new Telegram(token, {
	agent: socksAgent,
	webhookReply: true,
	webHook: {
		port: '3000'
	}
});

//bot.setWebhook(`${ngrok}/t${token}`);

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
			log.error(`Error sendMessage: ${error.message}`);
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
			resolve(setFileApiTelegram(chatId, file));
		} catch (error) {
			log.error(`Error sendFile: ${error.message}`);
			reject(error);
		}
	});
}

module.exports = {
	sendMessage,
	sendFile
};