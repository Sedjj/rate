const {log} = require('../utils/logger');

/**
 * Класс для состояния ставок
 */
class RateStatus {

	constructor() {
		this.jobStatus = true;
	}

	get status() {
		return this.jobStatus;
	}

	turnOn() {
		log.info('Betting mechanism will be enabled');
		return this.jobStatus = true;
	}

	turnOff() {
		log.debug('Betting mechanism will be stopped');
		return this.jobStatus = false;
	}
}

const rateStatus = new RateStatus();

module.exports = {
	rateStatus
};