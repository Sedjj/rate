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
		log.info('Betting mechanism will be stopped');
		return this.jobStatus = false;
	}
}

module.exports = {
	RateStatus
};