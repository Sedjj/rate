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

async function menu(msg) {
	const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
	await bot.sendMessage(chat, 'Hi, choose action!', {
		reply_markup: {
			keyboard: keyboardInit,
			parse_mode: 'Markdown'
		}
	});
}

bot.onText(/\/start/, response(async (msg) => {
	if (!msg.text) {
		return;
	}
	await menu(msg);
}));

bot.on('callback_query', async (msg) => {
	if (!msg.data) {
		return;
	}
	switch (msg.data) {
		case 'waiting':
			await sendAnsweText(msg, `Матчей ожидающих Total: ${counterWaiting.count}`);
			break;
		case 'twoDaysExportFootball':
			await sendAnsweText(msg, 'Ожидайте файл');
			exportFootballStatisticDebounce(2);
			break;
		case 'twoDaysExportTableTennis':
			await sendAnsweText(msg, 'Ожидайте файл');
			exportTableTennisStatisticDebounce(2);
			break;
		case 'weekExportFootball':
			await sendAnsweText(msg, 'Ожидайте файл');
			exportFootballStatisticDebounce(7);
			break;
		case 'weekExportTableTennis':
			await sendAnsweText(msg, 'Ожидайте файл');
			exportTableTennisStatisticDebounce(7);
			break;
		case 'exportBackupFootballs':
			await sendAnsweText(msg, 'Ожидайте файл');
			exportBackup('footballs');
			break;
		case 'exportBackupTableTennis':
			await sendAnsweText(msg, 'Ожидайте файл');
			exportBackup('tabletennis');
			break;
	}
	await menu(msg);
});

bot.on('message', response(async (msg) => {
	if (!msg.text) {
		return;
	}
	const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
	switch (msg.text.toString()) {
		case waiting:
			await sendText(msg, `Матчей ожидающих Total: ${counterWaiting.count}`);
			break;
		case exportTable:
			await inlineKeyboard(chat, menuList('export'));
			break;
		case backup:
			await inlineKeyboard(chat, menuList('backup'));
			break;
	}
}));

/**
 * Функция для генерации встроенной клавиатуры
 * @param chat
 * @param msg
 */
async function inlineKeyboard(chat, msg) {
	const options = {
		reply_markup: JSON.stringify({
			inline_keyboard: msg.buttons,
			parse_mode: 'Markdown'
		})
	};
	await bot.sendMessage(chat, msg.title, options);
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
async function accessCheck(msg) {
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
async function sendText(msg, text) {
	await bot.sendMessage(
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
async function deleteMessage(msg) {
	await bot.sendMessage(
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
async function sendAnsweText(msg, text) {
	await bot.answerCallbackQuery(
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
async function sendError(text) {
	await bot.sendMessage(
		config.myId,
		text
	);
}

module.exports = {
	sendError,
	deleteMessage
};