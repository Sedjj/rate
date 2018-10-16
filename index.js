const {CronJob} = require('cron');
const config = require('config');
const log = require('./src/utils/logger');
const {search} = require('./src/searchMatch');

const clearingTempFilesTime = process.env.NODE_ENV === 'development'
	? '*/05 * * * * *'
	: config.get('cron.clearingCronTime');

if (clearingTempFilesTime) {
	let clearingTempFilesJob;
	try {
		clearingTempFilesJob = new CronJob(clearingTempFilesTime, () => {
			search();
			log.info('clearingTempFilesTime', clearingTempFilesTime);
		}, null, true);
	} catch (ex) {
		clearingTempFilesJob.stop();
		log.info('cron pattern not valid');
	}
}