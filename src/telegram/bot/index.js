const config = require('config');
const TelegramBot = require('node-telegram-bot-api');
const {exportBackup} = require('../../backupBD');
const {counterWaiting} = require('../../utils/counterWaiting');
const {throttle} = require('../../utils/throttle');
const {exportFootballStatistic, exportTableTennisStatistic} = require('../../export');
const {use} = require('node-telegram-bot-api-middleware');

const exportFootballStatisticDebounce = throttle(exportFootballStatistic, 20000);
const exportTableTennisStatisticDebounce = throttle(exportTableTennisStatistic, 20000);

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
const twoDaysExportFootball = 'Экспорт футбола за 2 дня';
const twoDaysExportTableTennis = 'Экспорт тениса за 2 дня';
const weekExportFootball = 'Экспорт футбола за неделю';
const weekExportTableTennis = 'Экспорт за тениса неделю';
const exportBackupFootballs = 'Бэкап таблицы footballs';
const exportBackupTableTennis = 'Бэкап таблицы tableTennis';

const keyboard = [
	[waiting],
	[twoDaysExportFootball],
	[twoDaysExportTableTennis],
	[weekExportFootball],
	[weekExportTableTennis],
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
		case twoDaysExportFootball:
			sendText(msg, 'Ожидайте файл');
			exportFootballStatisticDebounce(2);
			break;
		case twoDaysExportTableTennis:
			sendText(msg, 'Ожидайте файл');
			exportTableTennisStatisticDebounce(2);
			break;
		case weekExportFootball:
			sendText(msg, 'Ожидайте файл');
			exportFootballStatisticDebounce(7);
			break;
		case weekExportTableTennis:
			sendText(msg, 'Ожидайте файл');
			exportTableTennisStatisticDebounce(7);
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