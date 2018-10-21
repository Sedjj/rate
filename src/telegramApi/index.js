const Telegraf = require('telegraf');
const SocksAgent = require('socks5-https-client/lib/Agent');
const log = require('../utils/logger');
const config = require('config');

const token = config.get('bot.token');
const proxy = config.get('proxy');
const channel = config.get('channel');

const socksAgent = new SocksAgent({
	socksHost: proxy.host,
	socksPort: proxy.port,
	socksUsername: proxy.login,
	socksPassword: proxy.psswd
});

const app = new Telegraf(token, {
	telegram: {agent: socksAgent}
});

app.catch((error) => {
	log.error(error);
});

/**
 * Метод отправки сообщений в телеграмм бот.
 *
 * @param {String} text строка для отправки в чат
 */
function sendMessage(text) {
	try {
		app.telegram.sendMessage(channel, text);
	} catch (error) {
		log.error(`Error sendMessage: ${error.message}`);
	}
}

/**
 * Метод отправки файла в телеграмм бот.
 *
 * @param {String} file для отправки в чат
 */
function sendFile(file) {
	try {
		app.telegram.sendDocument(channel, {file_id: file});
	} catch (error) {
		log.error(`Error sendFile: ${error.message}`);
	}
}

module.exports = {
	sendMessage,
	sendFile
};