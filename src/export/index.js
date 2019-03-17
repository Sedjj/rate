const path = require('path');
const config = require('config');
const {log} = require('../utils/logger');
const {readFile, saveBufferToFile, readFileToStream} = require('../utils/fsHelpers');
const {getStatistic} = require('../storage/football');
const XlsxTemplate = require('xlsx-template');
const {sendFile} = require('../telegram/api');

const storagePath = config.path.storagePath || process.cwd();
const exportTemplatesDirectory = config.path.directory.exportTemplates || 'exportTemplates';
const uploadDirectory = config.path.directory.upload || 'upload';

const reportsInput = config.path.storage.fileName.reports.input || 'Reports-list-default.xlsx';
const reportsOutput = config.path.storage.fileName.reports.output || 'Reports.xlsx';

const reportsPathInput = path.join(storagePath, exportTemplatesDirectory, reportsInput);
const reportsPathOutput = path.join(storagePath, uploadDirectory, reportsOutput);

/**
 * Метод для отправки бэкапа таблицы статистики
 *
 * @param {Number} days количество дней для экспорта
 * @returns {Promise<void>}
 */
async function exportBackupStatistic(days) {
	try {
		const file = await returnStatisticListTemplate(days);
		const filePath = await saveBufferToFile(reportsPathOutput, file);
		const stream = await readFileToStream(filePath);
		await sendFile(stream);
		log.debug('Файл statistic отправлен');
	} catch (error) {
		log.error(`Send statistic: ${error.message}`);
	}
}

/**
 * Возвращает заполненый шаблон списка статистики.
 *
 * @param {Number} days количество дней для экспорта
 * @returns {Promise<{statistics: Array} | never>}
 */
function returnStatisticListTemplate(days = 2) {
	const beforeDate = new Date(new Date().setUTCHours(0, 0, 0, 1));
	const currentDate = new Date(new Date().setUTCHours(23, 59, 59, 59));
	beforeDate.setUTCDate(beforeDate.getUTCDate() - days);
	let props = {
		statistics: [],
	};
	let query = {};
	query['$and'] = [];
	query['$and'].push({modifiedBy: {$gte: beforeDate.toISOString()}});
	query['$and'].push({modifiedBy: {$lte: currentDate.toISOString()}});
	log.debug(`Начало экспорта Statistics с ${beforeDate.toISOString()} по ${currentDate.toISOString()}`);
	return getStatistic(query)
		.then((items) => {
			props.statistics = items;
			log.debug(`Подготовлено данных ${items.length}`);
			return props;
		})
		.then((props) => {
			try {
				return readFile(reportsPathInput)
					.then(file => {
						const template = new XlsxTemplate(file);
						// Replacements take place on first sheet
						template.substitute(1, {
							statistics: props.statistics.filter((item) => item.strategy === 1)
						});
						template.substitute(2, {
							statistics: props.statistics.filter((item) => item.strategy === 2)
						});
						template.substitute(3, {
							statistics: props.statistics.filter((item) => item.strategy === 3)
						});
						template.substitute(4, {
							statistics: props.statistics.filter((item) => item.strategy === 4)
						});
						template.substitute(5, {
							statistics: props.statistics.filter((item) => item.strategy === 5)
						});
						template.substitute(6, {
							statistics: props.statistics.filter((item) => item.strategy === 6)
						});
						template.substitute(7, {
							statistics: props.statistics.filter((item) => item.strategy === 7)
						});
						/*template.substitute(8, {
							statistics: props.statistics.filter((statistic) => {
								if ((statistic.command.women !== 1) && (statistic.command.youth !== 1)) {
									switch (statistic.strategy) {
										case 1 :
											if ((statistic.snapshot.end.x < 3) && (statistic.snapshot.end.mod > 2.5)) {
												return true;
											}
											break;
										case 2 :
											if ((3000 < statistic.snapshot.end.time) && (statistic.snapshot.end.time < 3570)) {
												// A
												if (statistic.snapshot.start.p1 < statistic.snapshot.start.p2) {
													if ((statistic.cards.after.one.danAttacks < 46) && (statistic.snapshot.start.x > 2.5)) {
														if ((statistic.cards.after.one.attacks > 39) && (statistic.cards.before.one.shotsOn !== 1)) {
															return true;
														}
													}
												} else { //B
													if ((50 < statistic.cards.after.two.attacks) && (statistic.cards.after.two.attacks < 80)) {
														return true;
													}
												}
											}
											break;
										case 3 :
											if ((statistic.snapshot.end.time < 3720)) {
												// A
												if (statistic.snapshot.start.p1 < statistic.snapshot.start.p2) {
													if (statistic.snapshot.end.x < 2.4) {
														if ((statistic.cards.after.one.danAttacks > 50) && (statistic.cards.before.one.attacks > 52)) {
															return true;
														}
													}
												} else { //B
													if (statistic.snapshot.start.x < 2.4) {
														return true;
													}
												}
											}
											break;
									}
								}
								return false;
							})
						});*/
						log.debug('Генерация файла');
						return template.generate({type: 'nodebuffer'});
					});
			} catch (error) {
				log.error(`ExportError statisticList: ${error.message}`);
			}
		});
}

module.exports = {
	exportBackupStatistic
};