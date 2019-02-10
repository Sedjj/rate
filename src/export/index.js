const path = require('path');
const config = require('config');
const log = require('../utils/logger');
const {readFile, saveBufferToFile, readFileToStream} = require('../utils/fsHelpers');
const {getStatistic} = require('../storage/statistic');
const XlsxTemplate = require('xlsx-template');
const {sendFile} = require('../telegramApi');

const storagePath = config.get('path.storagePath') || process.cwd();
const exportTemplatesDirectory = config.get('path.directory.exportTemplates') || 'exportTemplates';
const uploadDirectory = config.get('path.directory.upload') || 'upload';

const reportsInput = config.get('path.storage.fileName.reports.input') || 'Reports-list-default.xlsx';
const reportsOutput = config.get('path.storage.fileName.reports.output') || 'Reports.xlsx';

const reportsPathInput = path.join(storagePath, exportTemplatesDirectory, reportsInput);
const reportsPathOutput = path.join(storagePath, uploadDirectory, reportsOutput);

/**
 * Метод для отправки бэкапа таблицы статистики
 *
 * @returns {Promise<void>}
 */
async function exportBackupStatistic() {
	try {
		const file = await returnStatisticListTemplate();
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
 * @returns {Promise<{statistic: Array, currentDate: Date} | never>}
 */
function returnStatisticListTemplate() {
	const beforeDate = new Date(new Date().setUTCHours(0, 0, 0, 1));
	const currentDate = new Date(new Date().setUTCHours(23, 59, 59, 59));
	beforeDate.setUTCDate(beforeDate.getUTCDate() - 7);
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
							statistics: props.statistics.filter((item) => {
								if ((3060 < item.snapshot.end.time && item.snapshot.end.time < 3570) && (item.command.women !== 1) && (item.strategy === 2)) {
									if (item.snapshot.start.p1 < item.snapshot.start.p2) {
										if (item.cards.after.one.attacks < 75) {
											return true;
										}
									} else {
										if (item.cards.after.two.attacks < 75) {
											return true;
										}
									}
								}
								return false;
							})
						});
						template.substitute(5, {
							statistics: props.statistics.filter((item) => {
								if ((item.command.women !== 1) && (item.command.youth !== 1)) {
									if (3000 < item.snapshot.start.time && item.snapshot.end.time < 3720) {
										if (item.snapshot.start.p1 < item.snapshot.start.p2) {
											if (item.cards.after.one.attacks < 99) {
												return true;
											}
										} else {
											if (item.cards.after.two.attacks < 99) {
												return true;
											}
										}
									}
								}
								return false;
							})
						});
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