const {CronJob} = require('cron');
const config = require('config');
const log = require('./src/utils/logger');
const {search} = require('./src/searchMatch');
const {exportBackupStatistic, exportEveryDayReport, exportEveryWeekReport} = require('./src/export');

const schedulerSearch = process.env.NODE_ENV === 'development'
	? '*/10 * * * * *'
	: config.get('cron.schedulerSearch');

const schedulerBackupExport = process.env.NODE_ENV === 'development'
	? '*/50 * * * * *'
	: config.get('cron.schedulerBackupExport');

const schedulerEveryDayExport = process.env.NODE_ENV === 'development'
	? '*/60 * * * * *'
	: config.get('cron.schedulerEveryDayExport');

const schedulerEveryWeekExport = process.env.NODE_ENV === 'development'
	? '*/60 * * * * *'
	: config.get('cron.schedulerEveryWeekExport');

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
			 // exportBackupStatistic();
		}, null, true);
	} catch (ex) {
		schedulerBackupExportJob.stop();
		log.error('cron pattern not valid');
	}
}

/**
 * Планировщик ежедневной отчетности
 */
if (schedulerEveryDayExport) {
	log.info('****start scheduler every day export****');
	let schedulerEveryDayExportJob;
	try {
		schedulerEveryDayExportJob = new CronJob(schedulerEveryDayExport, () => {
			 exportEveryDayReport();
		}, null, true);
	} catch (ex) {
		schedulerEveryDayExportJob.stop();
		log.error('cron pattern not valid');
	}
}


/**
 * Планировщик еженедельной отчетности
 */
if (schedulerEveryWeekExport) {
	log.info('****start scheduler every week export****');
	let schedulerEveryWeekExportJob;
	try {
		schedulerEveryWeekExportJob = new CronJob(schedulerEveryWeekExport, () => {
			exportEveryWeekReport();
			// schedulerEveryWeekExportJob.stop();
		}, null, true);
	} catch (ex) {
		schedulerEveryWeekExportJob.stop();
		log.error('cron pattern not valid');
	}
}