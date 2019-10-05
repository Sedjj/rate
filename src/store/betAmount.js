const {log} = require('../utils/logger');
const config = require('config');

const betAmount = config.emulator.betAmount;

/**
 * Класс для размера ставки
 */
class BetAmount {

	constructor() {
		this.amount = betAmount;
	}

	get bets() {
		return this.amount;
	}

	increase(amount) {
		log.info(`Betting increments will on ${amount}`);
		return this.amount = this.amount + amount;
	}

	decrease(amount) {
		log.info(`Betting decrements will on ${amount}`);
		return this.amount = this.amount - amount;
	}
}

module.exports = {
	BetAmount
};