const {CronJob} = require('cron');
const config = require('config');
const log = require('./src/utils/logger');
const {search} = require('./src/searchMatch');
const {exportBackupStatistic} = require('./src/export');

const schedulerSearch = process.env.NODE_ENV === 'development'
	? '*/10 * * * * *'
	: config.get('cron.schedulerSearch');

const schedulerBackupExport = process.env.NODE_ENV === 'development'
	? '*/40 * * * * *'
	: config.get('cron.schedulerBackupExport');

/**
 * Планировшик поиска матчей
 */
if (schedulerSearch) {
	log.info('****start scheduler search****');
	let schedulerSearchJob;
	try {
		schedulerSearchJob = new CronJob(schedulerSearch, () => {
			search();
		}, null, true);
	} catch (ex) {
		schedulerSearchJob.stop();
		log.error('cron pattern not valid');
	}
}

/**
 * Планировщик бэкапа статистики
 */
if (schedulerBackupExport) {
	log.info('****start scheduler backup export****');
	let schedulerBackupExportJob;
	try {
		schedulerBackupExportJob = new CronJob(schedulerBackupExport, () => {
			exportBackupStatistic();
		}, null, true);
	} catch (ex) {
		schedulerBackupExportJob.stop();
		log.error('cron pattern not valid');
	}
}