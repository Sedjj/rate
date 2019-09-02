process.env.NTBA_FIX_319 = 1;
const {CronJob, CronTime} = require('cron');
require('./utils/dbProvider');
require('./telegram/bot');
const rc = require('./utils/random-cron');
const config = require('config');
const {log} = require('./utils/logger');
const football = require('./storage/football');
const {bot: {performEmulation}} = require('./selenium/bot');
const {searchFootball} = require('./searchMatch');
const {checkingResults} = require('./checkingResults');

const numericalDesignationFootball = config.choice.live.football.numericalDesignation;

/*performEmulation('205296081', 9, `Total Over ${2.5}`);*/

const schedulerSearchFootball = {
	title: 'в секундах',
	before: 150,
	after: 250
};

const rendomSchedulerSearchFootball = process.env.NODE_ENV === 'development'
	? rc.some('seconds').between(20, 60).generate()
	: rc.some('seconds').between(
		schedulerSearchFootball.before,
		schedulerSearchFootball.after
	).generate();

const rendomSchedulerCheckingResults = process.env.NODE_ENV === 'development'
	? '*/45 * * * * *'
	: '00 05 10 * * 0-7';

/**
 * Планировшик поиска матчей по футболу.
 */
if (rendomSchedulerSearchFootball) {
	log.info('****start scheduler search****');
	let schedulerSearchJob = new CronJob(rendomSchedulerSearchFootball, () => {
		try {
			schedulerSearchJob.setTime(new CronTime(
				rc.some('seconds').between(
					schedulerSearchFootball.before,
					schedulerSearchFootball.after
				).generate()
			));
			searchFootball();
		} catch (error) {
			schedulerSearchJob.stop();
			log.error(`cron pattern not valid: ${error}`);
		}
	}, () => {
		schedulerSearchJob.start();
	}, true);
}

/**
 * Планировщик получения результатов матчей.
 */
if (rendomSchedulerCheckingResults) {
	log.info('****start scheduler checking results****');
	let schedulerCheckingResultsJob = new CronJob(rendomSchedulerCheckingResults, () => {
		try {
			if (process.env.NODE_ENV !== 'development') {
				checkingResults(football.getStatistic, football.setStatistic, numericalDesignationFootball);
			}
		} catch (error) {
			schedulerCheckingResultsJob.stop();
			log.error(`cron pattern not valid: ${error}`);
		}
	}, null, true);
}

console.log('NODE_ENV', process.env.NODE_ENV);