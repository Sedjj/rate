const Telegraf = require('telegraf');
const SocksAgent = require('socks5-https-client/lib/Agent');
const log = require('./../utils/logger');
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

app.catch((err) => {
	log.info(err);
});

/**
 * Отправка сообщений в телеграмм бот.
 *
 * @param {String} text строка для отправки в чат
 */
function sendMessage(text) {
	app.telegram.sendMessage(channel, text);
}

module.exports = {
	sendMessage
};