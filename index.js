const {CronJob} = require('cron');
const config = require('config');
const log = require('./src/utils/logger');
const {search} = require('./src/searchMatch');

const clearingTempFilesTime = process.env.NODE_ENV === 'development'
	? '*/20 * * * * *'
	: config.get('cron.clearingCronTime');

if (clearingTempFilesTime) {
	log.info('****start****');
	let clearingTempFilesJob;
	try {
		clearingTempFilesJob = new CronJob(clearingTempFilesTime, () => {
			search();
		}, null, true);
	} catch (ex) {
		clearingTempFilesJob.stop();
		log.error('cron pattern not valid');
	}
}