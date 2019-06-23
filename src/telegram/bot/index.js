const config = require('config');
const TelegramBot = require('node-telegram-bot-api');
const {exportBackup} = require('../../backupBD');
const {counterWaiting} = require('../../store/counterWaiting');
const {rateStatus} = require('../../store/rateStatus');
const {throttle} = require('../../utils/throttle');
const {exportFootballStatistic, exportTableTennisStatistic, exportTennisStatistic} = require('../../export');
const {use} = require('node-telegram-bot-api-middleware');
const agent = require('socks5-https-client/lib/Agent');
const path = require('path');
const {readFileToStream} = require('../../utils/fsHelpers');
const {sendFile} = require('../api');
const {menuList} = require('./menu');

const exportFootballStatisticDebounce = throttle(exportFootballStatistic, 20000);
const exportTableTennisStatisticDebounce = throttle(exportTableTennisStatistic, 20000);
const exportTennisStatisticDebounce = throttle(exportTennisStatistic, 20000);

const storagePath = config.path.storagePath || process.cwd();
const logsDirectory = config.path.directory.logs || 'logs';

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
const selectSport = 'Вид спорта';
const rate = 'Ставки';
const backup = 'Бэкап';
const getFile = 'Получить файл';

const keyboardInit = [
	[waiting],
	[rate],
	[selectSport],
	[backup],
	[getFile]
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

const slide = {
	name: '',
	count: 2
};

bot.on('callback_query', async (msg) => {
	if (!msg.data) {
		return;
	}
	const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
	switch (msg.data) {
		case 'up':
			slide.count++;
			await editMessageReplyMarkup(msg, slide.count.toString());
			break;
		case 'down':
			if (slide.count > 2) {
				slide.count--;
				await editMessageReplyMarkup(msg, slide.count.toString());
			}
			break;
		case 'export':
			await sendAnsweText(msg, 'Ожидайте файл');
			await exportStatisticDebounce();
			await menu(msg);
			break;
		case 'exportFootball':
			slide.name = 'football';
			await inlineKeyboard(chat, menuList('days'));
			break;
		case 'exportTableTennis':
			slide.name = 'tableTennis';
			await inlineKeyboard(chat, menuList('days'));
			break;
		case 'exportTennis':
			slide.name = 'tennis';
			await inlineKeyboard(chat, menuList('days'));
			break;
		case 'backupFootballs':
			await sendAnsweText(msg, 'Ожидайте файл');
			await exportBackup('footballs');
			await menu(msg);
			break;
		case 'backupTableTennis':
			await sendAnsweText(msg, 'Ожидайте файл');
			await exportBackup('tabletennis');
			await menu(msg);
			break;
		case 'backupTennis':
			await sendAnsweText(msg, 'Ожидайте файл');
			await exportBackup('tennis');
			await menu(msg);
			break;
		case 'enableBets':
			rateStatus.turnOn();
			await sendAnsweText(msg, 'Betting mechanism will be enabled');
			break;
		case 'turnOffBets':
			rateStatus.turnOff();
			await sendAnsweText(msg, 'Betting mechanism will be stopped');
			break;
		case 'debugLogs':
			await sendAnsweText(msg, 'Ожидайте файл');
			await getLogs();
			await menu(msg);
			break;
	}
});

bot.on('message', response(async (msg) => {
	if (!msg.text) {
		return;
	}
	const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
	slide.count = 2;
	slide.name = '';
	switch (msg.text.toString()) {
		case waiting:
			await sendText(msg, `Матчей ожидающих Total: ${counterWaiting.count}`);
			break;
		case selectSport:
			await inlineKeyboard(chat, menuList('selectSport'));
			break;
		case rate:
			await inlineKeyboard(chat, menuList('rate'));
			break;
		case backup:
			await inlineKeyboard(chat, menuList('backup'));
			break;
		case getFile:
			await inlineKeyboard(chat, menuList('getFile'));
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
 * Обертка для редактирования сообщения в боте.
 *
 * @param {Object} msg объект что пришел из telegram
 * @param {String} text текст для замены
 */
async function editMessage(msg, text) {
	const chatId = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
	const opts = {
		chat_id: chatId,
		message_id: msg.message.message_id
	};
	await bot.editMessageText(text, opts);
}

/**
 * Обертка для редактирования inline_keyboard в боте.
 *
 * @param {Object} msg объект что пришел из telegram
 * @param {String} text текст для замены
 * @returns {Promise<void>}
 */
async function editMessageReplyMarkup(msg, text) {
	const chatId = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
	const opts = {
		chat_id: chatId,
		message_id: msg.message.message_id
	};
	await bot.editMessageReplyMarkup({
		inline_keyboard: menuList('days', text).buttons
	}, opts);
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

/**
 * Общий метод для экспорта.
 */
function exportStatisticDebounce() {
	switch (slide.name) {
		case 'football':
			exportFootballStatisticDebounce(slide.count);
			break;
		case 'tableTennis':
			exportTableTennisStatisticDebounce(slide.count);
			break;
		case 'tennis':
			exportTennisStatisticDebounce(slide.count);
			break;
	}
	slide.count = 2;
	slide.name = '';
}

/**
 * Метод для получения лог файла.
 *
 * @returns {Promise<void>}
 */
async function getLogs() {
	try {
		const stream = await readFileToStream(path.join(storagePath, logsDirectory, 'debug.log'));
		await sendFile(stream);
	} catch (e) {
		console.log('Error getLogs -> ' + e);
	}
}

module.exports = {
	editMessage,
	sendError,
	deleteMessage
};