const path = require('path');
const config = require('config');
const {log} = require('../utils/logger');
const {saveBufferToFile, readFileToStream} = require('../utils/fsHelpers');
const {sendFile} = require('../telegram/api');
const {getStatisticsFootball} = require('./football');
const {getStatisticsTableTennis} = require('./tableTennis');
const {getStatisticsTennis} = require('./tennis');
const {getStatisticsBasketball} = require('./basketball');

const storagePath = config.path.storagePath || process.cwd();
const uploadDirectory = config.path.directory.upload || 'upload';

const outputFootball = config.path.storage.football.outputName || 'Reports.xlsx';
const outputTableTennis = config.path.storage.tableTennis.outputName || 'Reports.xlsx';
const outputTennis = config.path.storage.tennis.outputName || 'Reports.xlsx';
const outputBasketball = config.path.storage.basketball.outputName || 'Reports.xlsx';

/**
 * Метод для отправки экспорта статистики футбола
 *
 * @param {Number} days количество дней для экспорта
 * @returns {Promise<void>}
 */
async function exportFootballStatistic(days) {
	try {
		const file = await getStatisticsFootball(days);
		const filePath = await saveBufferToFile(path.join(storagePath, uploadDirectory, `${days}days-${outputFootball}`), file);
		const stream = await readFileToStream(filePath);
		await sendFile(stream);
		log.debug('Файл statistic отправлен');
	} catch (error) {
		log.error(`Send statistic: ${error.message}`);
	}
}

/**
 * Метод для отправки экспорта статистики настольного тениса
 *
 * @param {Number} days количество дней для экспорта
 * @returns {Promise<void>}
 */
async function exportTableTennisStatistic(days) {
	try {
		const file = await getStatisticsTableTennis(days);
		const filePath = await saveBufferToFile(path.join(storagePath, uploadDirectory, `${days}days-${outputTableTennis}`), file);
		const stream = await readFileToStream(filePath);
		await sendFile(stream);
		log.debug('Файл statistic отправлен');
	} catch (error) {
		log.error(`Send statistic: ${error.message}`);
	}
}

/**
 * Метод для отправки экспорта статистики тениса
 *
 * @param {Number} days количество дней для экспорта
 * @returns {Promise<void>}
 */
async function exportTennisStatistic(days) {
	try {
		const file = await getStatisticsTennis(days);
		const filePath = await saveBufferToFile(path.join(storagePath, uploadDirectory, `${days}days-${outputTennis}`), file);
		const stream = await readFileToStream(filePath);
		await sendFile(stream);
		log.debug('Файл statistic отправлен');
	} catch (error) {
		log.error(`Send statistic: ${error.message}`);
	}
}

/**
 * Метод для отправки экспорта статистики баскетбола
 *
 * @param {Number} days количество дней для экспорта
 * @returns {Promise<void>}
 */
async function exportBasketballStatistic(days) {
	try {
		const file = await getStatisticsBasketball(days);
		const filePath = await saveBufferToFile(path.join(storagePath, uploadDirectory, `${days}days-${outputBasketball}`), file);
		const stream = await readFileToStream(filePath);
		await sendFile(stream);
		log.debug('Файл statistic отправлен');
	} catch (error) {
		log.error(`Send statistic: ${error.message}`);
	}
}

module.exports = {
	exportFootballStatistic,
	exportTableTennisStatistic,
	exportTennisStatistic,
	exportBasketballStatistic,
};