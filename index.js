const {CronJob} = require('cron');
const config = require('config');
const log = require('./src/utils/logger');
const {search, saveRate, serchResult} = require('./src/searchMatch');
const {postResult} = require('./src/fetch');
const {sendMessage} = require('./src/telegramApi');

const clearingTempFilesTime = process.env.NODE_ENV === 'development'
	? '*/05 * * * * *'
	: config.get('cron.clearingCronTime');

if (clearingTempFilesTime) {
	let clearingTempFilesJob;
	try {
		clearingTempFilesJob = new CronJob(clearingTempFilesTime, () => {
			/*search();*/
			serchResult();
			/*sendMessage('hi');*/
			console.log('clearingTempFilesTime', clearingTempFilesTime);
			log.info(`Deleted temporary  file(s)`)
		}, null, true);
	} catch (ex) {
		clearingTempFilesJob.stop();
		console.log('cron pattern not valid');
	}
}