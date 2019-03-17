const config = require('config');
const TelegramBot = require('node-telegram-bot-api');
const {exportBackup} = require('../../backupBD');
const {counterWaiting} = require('../../utils/counterWaiting');
const {throttle} = require('../../utils/throttle');
const {exportBackupStatistic} = require('../../export');
const {use} = require('node-telegram-bot-api-middleware');

const exportBackupStatisticDebounce = throttle(exportBackupStatistic, 20000);

const supportToken = process.env.NODE_ENV === 'development'
	? config.bots.supportDev.token
	: config.bots.supportTest.token;

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
const exportBackupFootballs = 'Бэкап таблицы footballs';
const exportBackupTableTennis = 'Бэкап таблицы tableTennis';

const keyboard = [
	[waiting],
	[weekExport],
	[twoDaysExport],
	[exportBackupFootballs],
	[exportBackupTableTennis]
];

const response = use(accessCheck);

bot.on('message', response((msg) => {
	if (!msg.text) {
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
		case exportBackupFootballs:
			sendText(msg, 'Ожидайте файл');
			exportBackup('footballs');
			break;
		case exportBackupTableTennis:
			sendText(msg, 'Ожидайте файл');
			exportBackup('tabletennis');
			break;
		default:
			bot.sendMessage(msg.chat.id, 'Hi, choose action?', {
				reply_markup: {
					keyboard: keyboard
				}
			});
	}
}));

/**
 * Проверка прав на доступ к меню.
 *
 * @param {Object} msg объект что пришел из telegram
 */
function accessCheck(msg) {
	if (!administrators.some((user) => user === msg.from.id)) {
		this.stop();
	}
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