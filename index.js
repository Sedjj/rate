const {CronJob} = require('cron');
const config = require('config');
const log = require('./src/utils/logger')(module);

const clearingTempFilesTime = process.env.NODE_ENV === 'development'
	? '*/05 * * * * *'
	: config.get('cron.clearingCronTime');

if (clearingTempFilesTime) {
	let clearingTempFilesJob;
	try {
		clearingTempFilesJob = new CronJob(clearingTempFilesTime, () => {
			console.log('clearingTempFilesTime', clearingTempFilesTime);
			log.info(`Deleted temporary  file(s)`)
		}, null, true);
	} catch (ex) {
		clearingTempFilesJob.stop();
		console.log('cron pattern not valid');
	}
}