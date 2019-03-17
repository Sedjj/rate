const config = require('config');
const TelegramBot = require('node-telegram-bot-api');
const {counterWaiting} = require('../../utils/counterWaiting');
const {throttle} = require('../../utils/throttle');
const {exportBackupStatistic} = require('../../export');

const exportBackupStatisticDebounce = throttle(exportBackupStatistic, 20000);

const supportToken = process.env.NODE_ENV === 'development'
	? config.bots.dev.token
	: config.bots.test.token;

const proxy = config.proxy;
const administrators = config.roles.admin;

let props = {
	polling: true
};

if (process.env.NODE_ENV === 'development') {
	props = {
		...props,
		request: {
			proxy: `http://${proxy.user}:${proxy.password}@${proxy.host}:${proxy.port}`
		}
	};
}

const bot = new TelegramBot(supportToken, props);

const waiting = 'Сколько матчей в ожидании';
const weekExport = 'Экспорт за неделю';
const twoDaysExport = 'Экспорт за 2 дня';

const keyboard = [
	[waiting], [weekExport], [twoDaysExport]
];
bot.on('message', (msg) => {
	if (!accessCheck(msg.from)) {
		return;
	}
	switch (msg.text.toString()) {
		case waiting:
			sendText(msg, `Матчей ожидающих Total: ${counterWaiting.count}`);
			break;
		case weekExport:
			sendText(msg, 'Ожидайте файл');
			exportBackupStatisticDebounce(7);
			break;
		case twoDaysExport:
			sendText(msg, 'Ожидайте файл');
			exportBackupStatisticDebounce(2);
			break;
		default:
			bot.sendMessage(msg.chat.id, 'Hi, choose action?', {
				reply_markup: {
					keyboard: keyboard
				}
			});
	}
});

/**
 * Проверка прав на доступ к меню.
 *
 * @param {Object} from объек с пользователем что запрашивает меню
 */
function accessCheck(from) {
	return administrators.some((user) => user === from.id);
}

/**
 * Обертка для отправки сообщения в бот.
 *
 * @param {Object} msg объект что пришел из telegram
 * @param {String} text текст для отправки
 */
function sendText(msg, text) {
	bot.sendMessage(
		msg.chat.id,
		text,
		{
			reply_markup: {
				keyboard: keyboard
			}
		}
	);
}