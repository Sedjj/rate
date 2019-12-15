const {log} = require('../utils/logger');

/**
 * Класс для подтвержения телефона
 */
class AuthPhone {

	constructor() {
		this.currentPhone = '';
		this.currentCode = '';
		this.checkStatus = true;
	}

	get phone() {
		return this.currentPhone;
	}

	get code() {
		return this.currentCode;
	}

	get status() {
		return this.checkStatus;
	}

	setPhone(phone) {
		log.info(`Confirmation phone: ${phone}`);
		this.currentPhone = phone;
	}

	setCode(code) {
		log.info(`Verification code: ${code}`);
		this.currentCode = code;
	}

	turnOn() {
		log.info('Enable login verification');
		return this.checkStatus = true;
	}

	turnOff() {
		log.info('Stopped login verification');
		return this.checkStatus = false;
	}
}

module.exports = {
	AuthPhone
};