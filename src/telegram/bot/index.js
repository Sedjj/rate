const config = require('config');
const TelegramBot = require('node-telegram-bot-api');
const {exportBackup} = require('../../backupBD');
const {counterWaiting} = require('../../utils/counterWaiting');
const {throttle} = require('../../utils/throttle');
const {exportFootballStatistic, exportTableTennisStatistic} = require('../../export');
const {use} = require('node-telegram-bot-api-middleware');
const agent = require('socks5-https-client/lib/Agent');
const {menuList} = require('./menu');

const exportFootballStatisticDebounce = throttle(exportFootballStatistic, 20000);
const exportTableTennisStatisticDebounce = throttle(exportTableTennisStatistic, 20000);

const supportToken = process.env.NODE_ENV === 'development'
	? config.bots.supportDev.token
	: config.bots.supportTest.token;

/*const proxy = config.proxy;*/
const socket = config.socket;
const administrators = config.roles.admin;

let props = {
	polling: true
};

if (process.env.NODE_ENV === 'development') {
	props = {
		...props,
		request: {
			/*proxy: `http://${proxy.user}:${proxy.password}@${proxy.host}:${proxy.port}`*/
			agentClass: agent,
			agentOptions: {
				socksHost: socket.server,
				socksPort: socket.port,
				/*	socksUsername: socket.user,
					socksPassword: socket.pass*/
			}
		}
	};
}

const bot = new TelegramBot(supportToken, props);

const waiting = 'Сколько матчей в ожидании';
const exportTable = 'Экспорт';
const backup = 'Бэкап';

const keyboardInit = [
	[waiting],
	[exportTable],
	[backup]
];

const response = use(accessCheck);

function menu(msg) {
	const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
	bot.sendMessage(chat, 'Hi, choose action!', {
		reply_markup: {
			keyboard: keyboardInit,
			parse_mode: 'Markdown'
		}
	});
}

bot.onText(/\/start/, response((msg) => {
	if (!msg.text) {
		return;
	}
	menu(msg);
}));

bot.on('callback_query', (msg) => {
	if (!msg.data) {
		return;
	}
	switch (msg.data) {
		case 'waiting':
			sendAnsweText(msg, `Матчей ожидающих Total: ${counterWaiting.count}`);
			break;
		case 'twoDaysExportFootball':
			sendAnsweText(msg, 'Ожидайте файл');
			exportFootballStatisticDebounce(2);
			break;
		case 'twoDaysExportTableTennis':
			sendAnsweText(msg, 'Ожидайте файл');
			exportTableTennisStatisticDebounce(2);
			break;
		case 'weekExportFootball':
			sendAnsweText(msg, 'Ожидайте файл');
			exportFootballStatisticDebounce(7);
			break;
		case 'weekExportTableTennis':
			sendAnsweText(msg, 'Ожидайте файл');
			exportTableTennisStatisticDebounce(7);
			break;
		case 'exportBackupFootballs':
			sendAnsweText(msg, 'Ожидайте файл');
			exportBackup('footballs');
			break;
		case 'exportBackupTableTennis':
			sendAnsweText(msg, 'Ожидайте файл');
			exportBackup('tabletennis');
			break;
	}
	menu(msg);
});

bot.on('message', response((msg) => {
	if (!msg.text) {
		return;
	}
	const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
	switch (msg.text.toString()) {
		case waiting:
			sendText(msg, `Матчей ожидающих Total: ${counterWaiting.count}`);
			break;
		case exportTable:
			inlineKeyboard(chat, menuList('export'));
			break;
		case backup:
			inlineKeyboard(chat, menuList('backup'));
			break;
	}
}));

/**
 * Функция для генерации встроенной клавиатуры
 * @param chat
 * @param msg
 */
function inlineKeyboard(chat, msg) {
	const options = {
		reply_markup: JSON.stringify({
			inline_keyboard: msg.buttons,
			parse_mode: 'Markdown'
		})
	};
	bot.sendMessage(chat, msg.title, options);
	/*bot.sendMessage(chat, ' ', {
		reply_markup: {
			remove_keyboard: true
		}
	});*/
}

/**
 * Проверка прав на доступ к меню.
 *
 * @param {Object} msg объект что пришел из telegram
 */
function accessCheck(msg) {
	const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
	if (!administrators.some((user) => user === chat)) {
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
					keyboard: keyboardInit
				}
			}
		);
}

/**
 * Обертка для удаления сообщения
 * @param {Object} msg объект что пришел из telegram
 */
function deleteMessage(msg) {
	bot.sendMessage(
		msg.chat.id,
		msg.message_id,
		{
			reply_markup: {
				remove_keyboard: true
			}
		}
	);
}

/**
 * Обертка для отправки alert сообщения в бот.
 *
 * @param {Object} msg объект что пришел из telegram
 * @param {String} text текст для отправки
 */
function sendAnsweText(msg, text) {
	bot.answerCallbackQuery(
		msg.id,
		text,
		true
	);
}

/**
 * Обертка для отправки сообщений об ошибке.
 *
 * @param {String} text текст для отправки
 */
function sendError(text) {
	bot.sendMessage(
		config.myId,
		text
	);
}

module.exports = {
	sendError
};