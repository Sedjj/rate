const config = require('config');
const TelegramBot = require('node-telegram-bot-api');
const {exportBackup} = require('../../backupBD');
const {rateStatus, rateAmount, counterWaiting, authPhone} = require('../../store');
const {throttle} = require('../../utils/throttle');
const {exportFootballStatistic, exportTableTennisStatistic, exportTennisStatistic, exportBasketballStatistic} = require('../../export');
const {use} = require('node-telegram-bot-api-middleware');
const path = require('path');
const {readFileToStream} = require('../../utils/fsHelpers');
const {sendFile} = require('../api');
const {menuList} = require('./menu');

const exportFootballStatisticDebounce = throttle(exportFootballStatistic, 20000);
const exportTableTennisStatisticDebounce = throttle(exportTableTennisStatistic, 20000);
const exportTennisStatisticDebounce = throttle(exportTennisStatistic, 20000);
const exportBasketballStatisticDebounce = throttle(exportBasketballStatistic, 20000);

const storagePath = config.path.storagePath || process.cwd();
const logsDirectory = config.path.directory.logs || 'logs';

const supportToken = process.env.NODE_ENV === 'development'
	? config.bots.supportDev.token
	: config.bots.supportProd.token;

const administrators = config.roles.admin;

let props = {
	polling: true
};

const bot = new TelegramBot(supportToken, props);

const waiting = 'Сколько матчей в ожидании';
const selectSport = 'Вид спорта';
const rate = 'Ставки';
const getFile = 'Получить файл';
const backup = 'Бэкап';
const betAmount = 'Сумма ставки';
const verification = 'включить проверку входа в систему';

const keyboardInit = [
	[waiting],
	[rate],
	[selectSport],
	[getFile],
	[backup],
	[betAmount],
	[verification],
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

bot.onText(/code-(\d{4,6})$/, response(async (msg) => {
	const code = msg.text.split('-')[1];
	if (code) {
		authPhone.setCode(code);
	}
}));

bot.onText(/tel-(\d{8})$/, response(async (msg) => {
	const phone = msg.text.split('-')[1];
	if (phone) {
		authPhone.setPhone(phone);
	}
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
			await editMessageReplyMarkup(msg, 'days', slide.count.toString());
			break;
		case 'down':
			if (slide.count > 2) {
				slide.count--;
				await editMessageReplyMarkup(msg, 'days', slide.count.toString());
			}
			break;
		case 'upBets':
			rateAmount.increase(10);
			await editMessageReplyMarkup(msg, 'betAmount', rateAmount.bets.toString());
			break;
		case 'downBets':
			if (rateAmount.bets > 10) {
				rateAmount.decrease(10);
				await editMessageReplyMarkup(msg, 'betAmount', rateAmount.bets.toString());
			}
			break;
		case 'export':
			await sendAnswerText(msg, 'Ожидайте файл');
			await exportStatisticDebounce();
			await menu(msg);
			break;
		case 'exportFootball':
			slide.name = 'football';
			await inlineKeyboard(chat, menuList('days', slide.count.toString()));
			break;
		case 'exportTableTennis':
			slide.name = 'tableTennis';
			await inlineKeyboard(chat, menuList('days', slide.count.toString()));
			break;
		case 'exportTennis':
			slide.name = 'tennis';
			await inlineKeyboard(chat, menuList('days', slide.count.toString()));
			break;
		case 'exportBasketball':
			slide.name = 'basketball';
			await inlineKeyboard(chat, menuList('days', slide.count.toString()));
			break;
		case 'backupFootballs':
			await sendAnswerText(msg, 'Ожидайте файл');
			await exportBackup('footballs');
			await menu(msg);
			break;
		case 'backupTableTennis':
			await sendAnswerText(msg, 'Ожидайте файл');
			await exportBackup('tabletennis');
			await menu(msg);
			break;
		case 'backupTennis':
			await sendAnswerText(msg, 'Ожидайте файл');
			await exportBackup('tennis');
			await menu(msg);
			break;
		case 'backupBasketball':
			await sendAnswerText(msg, 'Ожидайте файл');
			await exportBackup('basketball');
			await menu(msg);
			break;
		case 'enableBets':
			rateStatus.turnOn();
			await sendAnswerText(msg, 'Betting mechanism will be enabled');
			break;
		case 'turnOffBets':
			rateStatus.turnOff();
			await sendAnswerText(msg, 'Betting mechanism will be stopped');
			break;
		case 'debugLogs':
			await sendAnswerText(msg, 'Ожидайте файл');
			await getLogs();
			await menu(msg);
			break;
		case 'enableVerification':
			authPhone.turnOn();
			await sendAnswerText(msg, 'Enable login verification');
			break;
		case 'turnOffVerification':
			authPhone.turnOff();
			await sendAnswerText(msg, 'Stopped login verification');
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
		case betAmount:
			await inlineKeyboard(chat, menuList('betAmount', rateAmount.bets.toString()));
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
		case verification:
			await inlineKeyboard(chat, menuList('verification'));
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
 * @param {String} text названиеы
 * @param {String} count текст для замены
 * @returns {Promise<void>}
 */
async function editMessageReplyMarkup(msg, text, count) {
	const chatId = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
	const opts = {
		chat_id: chatId,
		message_id: msg.message.message_id
	};
	await bot.editMessageReplyMarkup({
		inline_keyboard: menuList(text, count).buttons
	}, opts);
}

/**
 * Обертка для отправки alert сообщения в бот.
 *
 * @param {Object} msg объект что пришел из telegram
 * @param {String} text текст для отправки
 */
async function sendAnswerText(msg, text) {
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
		case 'basketball':
			exportBasketballStatisticDebounce(slide.count);
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